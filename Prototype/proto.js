//take advantage of the fact that we know at COMPILE TIME which properties from which
//objects the template system cares about. this lets us build out fns that don't rely
//on dynamic property access.

var globalSweepQueue = [];
var chainSweepQueue = [];

var SomethingObserved = function () {
    this.field0 = null; //1 << 1
    this.field2 = null; //1 << 2
    this.field3 = null; //1 << 3
    this.observers = []; //new CustomArray() (for fast delete we just swap) profile this
    this.propertyChanges = [];

    this.onSet = function (prop, value) {
        if (this.propertyChanges.length === 0) {
            globalSweepQueue.push(this);
        }
        if (this.propertyChanges.indexOf(prop) === -1) {
            //easy way
            this.propertyChanges.push(prop);
            //it might be interesting to store a pre created function per prop instead pushing a string onto
            //a list and dynamically looking up observers. this will most definitely need to be profiled
            //this.propertyChanges.push(this.propFns[prop]);
        }
        this.properties[prop] = value;
        //this might reduce garbage collection pressure by prestoring strings..profile this
        //this.propertyChanges.push(this.PROPERTIES[prop]);
    };

    this.sweep = function () {
        this.propertyChanges.forEach(function (changeName) {
            var property = this[changeName];
            var observers = this.observers[changeName];
            for (var i = 0; i < observers.length; i++) {
                observers[i].fn(observers[i], this, property);
            }
        }, this);
        //use a better array representation to clear nicely? again, profile this
        this.propertyChanges.splice(0, this.propertyChanges.length);
    };
};

//things to profile
//1. Using Object.keys + iterating over globalSweepQueue, saves a branch on each observed property set.
//2. Generating Fns with new Function() vs using dynamic property lookups which a vm cannot optimize
//3. Using a pre defined function for the __propertyChanges.push argument instead of a string.
//   this would save a dynamic lookup and possibly allow vm to optimize a little better
//4. Using for loop over forEach

var Bathroom = (function () {

    function Bathroom() {
        this.__properties = {
            sink: null,
            toilet: null,
            shower: null
        };
        this.__propertyChanges = [];
        this.__chains = {};
    }

    Object.defineProperty(Bathroom.prototype, 'sink', {
        get: function () {
            return this.__properties.sink;
        },
        set: function (value) {
            if (this.__propertyChanges.length === 0) {
                globalSweepQueue.push(this);
            }
            if (this.__propertyChanges.indexOf('sink') === -1) {
                this.__propertyChanges.push('sink');
            }
            this.__properties.sink = value;
        }
    });

    //below is a mixin
    Bathroom.prototype.sweep = function () {
        this.__propertyChanges.forEach(function (propertyName) {
            this.__chains[propertyName].forEach(function (chain) {
                chain.chainFn(this.__properties[propertyName]);
            }, this);
        }, this);
    };

    Bathroom.prototype.addChain = function (chain, propertyName) {
        if (!this.__chains[propertyName]) {
            this.__chains[propertyName] = []
        }
        this.__chains[propertyName].push(chain);
    };

    //since I control this, I might be able to do away with if(!chains) and if(index !== -1)
    Bathroom.prototype.removeChain = function (chain, propertyName) {
        var chains = this.__chains[propertyName];
        if (!chains) return;
        var index = chains.indexOf(chain);
        if (index !== -1) {
            chains.splice(index, 1);
        }
    };

    return Bathroom;
})();

//path created at template compile time: ['hotel', 'bathroom', 'sink', ['capacity', 'full']]
//a single chain handles as many properties as possible



var chainSweep = function () {
    //grab first (lowest change index) items from changes array (can be many at the same level, ie siblings)
    //traverse down the chain (be aware that chains can fork), swapping listeners
    var traversalRoots = [this.changes[0]];
    var startLevel = this.changes[0].level;
    for (var i = 1; i < this.changes.length; i++) {
        if (this.changes[i].level === startLevel) {
            traversalRoots.push(this.changes[i]);
        } else {
            break;
        }
    }
    var traverse = function (chainLink) {
        chainLink.traverse();
    };
    traversalRoots.forEach(traverse);
};



var Observer = (function () {
    function Observer() {
    }

    Observer.mixin = function (target) {
        target.__chains = {};
        target.__propertyChanges = [];
        target.__properties = {};
        var prototype = target.constructor.prototype;
        prototype.addChain = Observer.addChain;
        prototype.removeChain = Observer.removeChain;
        prototype.sweep = Observer.sweep;
    };

    //todo consider doing this with new Function to prevent dynamic property access
    //probably do this in a batch so we only use 1 call to new Function()
    Observer.createObservedProperty = function (target, property) {
        Object.defineProperty(target, property, {
            get: function () {
                return this.__properties[property];
            },
            set: function (value) {
                //possibly, assuming iteration over Object.keys. Saves work at user code time, more work at sweep time
                //globalSweepQueue[this.__observerId] = this; //maybe should not do this
                //this.__propertyChanges[property] = value;   //probably do this
                if (this.__propertyChanges.length === 0) {
                    globalSweepQueue.push(this);
                }
                if (this.__propertyChanges.indexOf(property) === -1) {
                    this.__propertyChanges.push(property);
                }
                this.__properties[property] = value;
            }
        })
    };

    Observer.addChain = function (chain, propertyName) {
        var chains = this.__chains[propertyName];
        if (chains) {
            chains.push(chain);
        } else {
            this.__chains[propertyName] = [chain];
        }
    };

    //since this only used for templates I have total control and know 100% that the chain is there.
    //if this is generalized, will need to check for chain presence before removal
    Observer.removeChain = function (chain, propertyName) {
        var chains = this.__chains[propertyName];
        chains.splice(chains.indexOf(chain), 1);
    };

    Observer.sweep = function () {
        this.__propertyChanges.forEach(function (propertyName) {
            this.__chains[propertyName].forEach(function (chain) {
                chain.chainFn(this.__properties[propertyName]);
            }, this);
        }, this);
    };
    return Observer;
})();

//blocks know what they care about, subscribe to those properties
//up to block to render / not render self


var ChainLink = function () {
    this.children = [];
    this.valueToSet = null;
    this.currentValue = null;
    this.propertyName = null;
    this.templatePropertyPath = null;
    this.template = null;
};

ChainLink.prototype.observify = function (objToObserve) {
    if (!objToObserve.__chains) Observer.mixin(objToObserve);
};

ChainLink.prototype.addChild = function (chain) {
    this.children.push(chain);
};

ChainLink.prototype.chainFn = function (newPropertyValue) {
    this.valueToSet = newPropertyValue;
};

//ONLY NEED VALUES OF TERMINAL NODES PER TEMPLATE
//if this is a non terminal chain and value is null or primitive -> tell children to remove. set end value to null
//if this is a terminal node and type is object -> JSON.stringify it, compare that to previous stringified json value
//if this ia a terminal node and type is function -> toString() it, compare that to previous toString() value (or do nothing at all like angular)

//two types of chains objects: terminal and non terminal

ChainLink.prototype.traverse = function () {
    var value = this.valueToSet;
    var type = typeof value;
    var oldType = typeof this.currentValue;
    if (this.shouldRemoveListeners) {
        this.currentValue.removeChain(this, this.propertyName);
        this.shouldRemoveListeners = false;
    }
    if (!value || typeof value === 'primitive') {
        //children.remove();
    } else {
        //children.add();
    }
    //if this.shouldRemoveListeners == false and typeof new value is null or primitive, we can probably skip traversal
    //of the children since we know they wont be getting a new value.
    if (this.shouldRemoveListeners || (oldType === 'object' || oldType === 'function')) {
        this.children.forEach(function (child) {
            child.traverse();
        });
    }
    if (type === 'object' || type === 'function') {
        this.observify(value);
        value.addChain(this, this.propertyName);
        this.shouldRemoveListeners = true;
    }

    this.currentValue = value; //store value for next change
    this.valueToSet = null; //release reference so it can possibly be collected
    worker.postMessage({
        messageType: WorkerMessageType.Chain,
        templateId: this.template.id,
        property: this.templatePropertyPath
    });
    //this.template.set(this.templatePropertyPath, value); //reflect change back to template
};
function TerminalChainLink() {

}

TerminalChainLink.prototype.traverse = function () {
    var value = this.valueToSet;
    var uploadValue = null;
    var type = typeof value;
    if (value && type === 'object') {
        uploadValue = JSON.stringify(value);
    } else if (type === 'function') {
        uploadValue = value.toString();
    } else {
        uploadValue = value;
    }
    if (uploadValue == this.currentValue) return;
    this.currentValue = uploadValue;
    worker.postMessage({
        key: this.templatePropertyPath,
        value: uploadValue
    });
};
//   self  child
//template.obj.fn.goo
function NonTerminalChainLink() {}

NonTerminalChainLink.prototype.traverse = function() {
    if(this.lastUpdateFrame === Shift.currentFrame) return;
    this.lastUpdateFrame = Shift.currentFrame;
    var value = this.valueToSet;
    var type = typeof value;
    if(type && type === 'object' || type === 'function') {
        if(!value.__observers) observify(value, this.propertyName);
        for(var i = 0; i < this.children.length; i++) {
            this.children[i].traverse();
        }
    } else {
        for(i = 0; i < this.children.length; i++) {
            this.children[i].clear();
        }
    }
};

NonTerminalChainLink.prototype.changed = function (value) {
    this.template.propertyChanged(this.propertyName, this.level);
};

var Template = function() {
    this.properties = {};
};

Template.prototype.propertyChanged = function(property, level) {
    var propStructure = this.properties[property];
    if(propStructure.level === -1) {
        templateSweepQueue.push(this);
        //since we know we changed set level to terminal, will likely be overwritten later but this sets it to a non -1 value
        propStructure.level = propStructure.chains.length;
    }
    if(level < propStructure.level) {
        propStructure.level = level;
    }
};

//below, the two properties share chain refs for airplane and pilot but have different chain refs for wife.
//airplane.pilot.wife
//airplane.pilot.wife.name
var templatePropertyChange = {
    level: -1,                      //denotes which index in the chains array to start at
    chains: [chain, chain, chain]   //array of chain references that when walked, comprise this property chain.
};

var notifyTemplateChange = function() {
    this.template.propertyChanged(this.propertyName, this.level);
};
//todo implement array methods for much speed increase. Where possible use array indices to map to things instead of
//string identifiers. This a 'do it later' feature.

var SomeObject = function() {
    this.__properties = {};
    this.__propertyChanges = {};
    this.setX = function(value) {
        if(!this.inSweep) sweepQueue.push(this);
        this.__properties['x'] = value;
        this.__propertyChanges['x'] = true;
    };

    this.sweep = function() {
        var keys = Object.keys(this.__propertyChanges);
        for(var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if(this.__propertyChanges[key]) {
                this.__propertyChanges[key] = false;
                var chains = this.__chains[key];
                var value = this.__properties[key];
                for(var j = 0; j < chains.length; j++) {
                    chains[i].changed(value);
                }
            }
        }
    }
};


//having a concept of a 'work queue' that has given 'load' (time between ticks?) it would really cool to have abstraction
//that would delegate work to a worker or the main thread depending on load, aggregate their events into one interface
//and major profit. This could even work for computing 'should I render' for each block, if we lift any inline function
//calls from if / elseif / unless headers into variables and compute them before the worker starts, we can transfer their
//values to the workers, and update them on change. Will need to profile sending / receiving LOTS of little messages to
//and from workers. The upside is that the algorithms are pretty much the same for computing something on the UI thread
//vs the worker thread, so if a platform doesn't support webworkers we aren't sunk.

//it might be possible to offload a lot of work to a web worker.
//figuring out which elements / attributes are dirty on a per block basis
//figuring out style changes that need to happen to scope css
//animation curve crunching
//image compression / decompression
//ajax

function Worker() {
    this.onmessage = function (message) {
        switch (message.messageType) {
            case WorkerMessageType.Chain:
                var blocks = this.blocks[message.templateId];
                var blocksForProp = blocks[message.property];
                //template
                //propertyNames
                //blocks
                //elements
                //attributes
                //removing a block:
                //for each property block cares about
                //delete template[propertyName][blockId]
                //adding a block:
                //foreach property block cares about
                //template[propertyName][blockId] = {
                //          elements: [index], attributes: [index]
                //}
                break;
        }
    }
}


//last sink value still has chain fns called on it
bathroom.sink = new Sink();
//chain is incorrectly subscribed to sink.full since bathroom.sink is pointing a different instance than chain.bathroom_sink
//but, thats ok since sink changed, we know that by end of sweep the right thing will happen and listeners will be moved
bathroom.sink.full = true;
//chains are updated in sweep to point to the right place, removed from last sink value
globalSweepQueue.sweep();


var Sweep = function () {
    var sweep = function sweepFn(sweepObject) {
        sweepObject.sweep();
    };

    globalSweepQueue.forEach(sweep);
    chainSweepQueue.forEach(sweep);
    //templateSweepQueue.forEach(sweep);
    //observedArraySweep -> add chains, reset growth count to 0
};


//maybe shallow copy arrays in templates so template sorting doesn't fire off shit tons of observers
var TemplateArray = function () {
    this.push = function (items) {
        //at sweep phase, grow chains if needed  them and set values
    };

    this.get = function () {

    };

    this.set = function () {
        if (this.length !== base.length) {

        }
    };

    this.grew = function () {
        this.observers.forEach(function (observer) {
            block.generate(this.grewBy, this);
            //add changes to template change list, but only root level, children will be picked up via traversal
        }, this);
    };
};

var generate = function (count, array) {
    for (var i = 0; i < count; i++) {
        var child = new Block();
        child.templateData = this.childTemplateDate; //plug in real stuff here later
        child.createChains(array.get(array.length - (i + count + 1)));
        this.baseArray.push(child);
    }
    //apply filters
    this.displayArray.applyFilters(this.filters);
};

var evaluateForRendering = function (changes) {
    var shouldRender = this.parent.isRendered && this.renderFunction();
    if (shouldRender) {
        if (this.isRendered) {
            //update
        } else {
            //insert
        }
        this.children.forEach(function (child) {
            child.evaluateForRendering();
        });
    } else {
        if (this.isRendered) {
            //remove
            this.children.forEach(function (child) {
                //child.evaluateForRendering();
                child.doNotRender();
            });
        } else {
            //do nothing
        }
    }
};

var TemplateInterface = function () {
    this.changes = [];
    this.observingBlocks = {};
    this.alteredBlocks = [];
};

TemplateInterface.prototype.eval = function () {
    //blocks, attributes
    //sort changed blocks so parent blocks are evaluated before child blocks
    this.alteredBlocks.sort(function (a, b) {
        return a.level > b.level;
    });
    this.alteredBlocks.forEach(function (block) {
        block.evaluateForRendering();
    });
};

TemplateInterface.prototype.set = function (propertyName, value) {
    this[propertyName] = value;
    this.changes.push(propertyName);
};