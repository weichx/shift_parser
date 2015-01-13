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

//created on template interface prototypes? created at compile time?
var Chain_SomeId = function (path) {
    path.forEach(function (pathSegment, i) {
        if (Array.isArray(pathSegment)) {
            pathSegment.forEach(function (segment) {
                //do the same as in the else, probably recurse since we need to handle forks within forks
            });
        } else {
            //if not precompiled, define property here
            this.hotel_bathroom_sink = null;
            //called when globalSweeQueue.sweep is called
            //need to update chains if a mid chain property changed
            //we want to update at the end, which means that chainFn may be called where it shouldn't
            var chainFn = function (_this, propertyValue) {
                var level = i;
                var property = pathSegment; //path so far, ie hotel_bathroom_sink
                //_this.hotel_bathroom.updateChildChains('sink', _this);

                //set the local property reference
                //if precompiled or use a generated fn:
                _this.hotel_bathroom_sink = propertyValue;
                //otherwise:
                _this[property] = propertyValue;
                //mark that it changed if something higher up on the chain hasn't already been changed
                //if something higher has been changed, this is invalidated
                if (_this.changeLevel <= level) {
                    _this.changeLevel = level;
                    _this.changes.push('hotel_bathroom_sink' /*property*/);
                }
            };
        }
    });
};

var chainFn = function (_this, propertyValue) {
    var level = i;
    var property = pathSegment; //path so far, ie hotel_bathroom_sink
    if (_this.changeLevel <= level) {
        _this.changeLevel = level;
        _this.changes.insert(pathSegment);
    }
};

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


var Chain = function () {

};

var Types = {
    Null: 0,
    Primitive: 1,
    Function: 2,
    Object: 3
};

var typeMap = {
    object: Types.Object,
    'function': Types.Object,
    number: Types.Primitive,
    boolean: Types.Primitive,
    string: Types.Primitive,
    'undefined': Types.Null
};

var getType = function (itemToCheck) {
    var type = typeof itemToCheck;
    if (type === 'object' && !itemToCheck) {
        return Types.Null;
    } else {
        return typeMap[type];
    }
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

ChainLink.prototype.traverse = function () {
    var value = this.valueToSet;
    var type = typeof value;
    var oldType = typeof this.currentValue;
    if (this.shouldRemoveListeners) {
        this.currentValue.removeChain(this, this.propertyName);
        this.shouldRemoveListeners = false;
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
    this.template.set(this.templatePropertyPath, value); //reflect change back to template
};

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

TemplateInterface.prototype.eval = function() {
    //blocks, attributes
    //sort changed blocks so parent blocks are evaluated before child blocks
    this.alteredBlocks.sort(function(a, b) {
        return a.level > b.level;
    });
    this.alteredBlocks.forEach(function(block) {
        block.evaluateForRendering();
    });
};

TemplateInterface.prototype.set = function (propertyName, value) {
    this[propertyName] = value;
    this.changes.push(propertyName);
};