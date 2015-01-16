class DedicatedWorkerThread {
    private worker : Worker;
    public onMessage : (message : MessageEvent) => void;

    constructor(workerScriptPath, onMessage : (message : MessageEvent) => void = null) {
        this.worker = new Worker(workerScriptPath);
        this.onMessage = onMessage;
        this.worker.onmessage = this.onMessage;
    }

    postMessage(messageType, message) {
        this.worker.postMessage({
            messageType : messageType,
            message : message
        });
    }
}

var templateThread = new DedicatedWorkerThread('../thread_build/worker.js', function (messageEvent) {
    console.log(messageEvent);
});

templateThread.postMessage('greeting', 'hello');

enum MessageType {
    PropertiesChanged
}

class TemplateObserver {
    private id : number = 0;
    private properties = {};
    private propertyChanges = {};
    static sweepMap = {};

    set(propertyName, value) {
        TemplateObserver.sweepMap[id] = this;
        this.propertyChanges[propertyName] = true;
        this.properties[propertyName] = value;
    }

    get(propertyName) {
        return this.properties[propertyName];
    }

    sweep() {
        templateThread.postMessage(MessageType.PropertiesChanged, {
            objectId : this.id,
            changes : this.propertyChanges
        });
        this.propertyChanges = {};
    }
}

var someObject = new TemplateObserver();
someObject.set('x', 5);

class TemplateInterface {
    public id;
    public propertyChanges = {};

    set(propertyName, value) {

    }

    sweep() {
        var watcherMap = {
            '1' : [{
                lastValue : '',
                propertyName : 'wing',
                watchers : [{
                    level : 1,
                    templateId : 11,
                    propertyPath : 'airplane_wings'
                }]
            }]
        };

        //todo implement array sort that doesn't fire off listeners, publish changes as index changes

        //this is great but how do we destroy things? If watcher count === 0? if watcher count === 0 && some time has elapsed?
        //do we need to send up ALL properties? would it make sense to just sendup the ones that are observed?
        //issue with garbage collecting sync object is the front end will not unset it's sync id even if the backend
        //one is gc'd.
        //
        // Maybe only set sync id if object is observed, when watchers === 0, unset front end syncId, delete worker sync object w/ that id.
        // maybe only do that after watcher count === 0 && some time elapsed && worker is not pressured. (1 minute?)


        //if type of changed property === primitive || null || undefined, will also want to syncify it, but it doesn't take an id,
        //rather it uses it's parent id and has a sync type of SyncTypes.Primitive.

        //syncify is probably called AFTER the observer sweep phase, or during it we are willing to queue objects referencing
        //sync ids we don't have yet. If end of phase event and worker sycn id pending queue is empty, throw an error.

        var syncify = function (property) {
            //if we find an object / function / array reference that has a syncid set, replace that key with the sync id
            //functions with static properties are converted to objects with those same properties
            //functions with no static properties are ignored
            //ignore prototypes? probably, but they could have static properties we want to extract.
            //primitives are unchanged
            //arrays might be turned into objects, again lifting static properties
            //if an object can't be transferred to webworker, just blow up.
            var output = [];

            //should return an array of all objects syncified in this pass (if an object was already syncified, it will be just a sync id and live in another sync object)
            property.syncId = '***' + 1; //string so we check it and be sure its not a number
            if (typeof property === 'object') {
                for (var key in property) {
                    if (property.hasOwnProperty(key)) {
                        if (Array.isArray(property[key])) {

                        } else if (typeof property[key] === 'object') {
                            if (property[key].syncId) {
                                property[key] = property[key].syncId;
                            } else {

                            }
                        } else if (typeof property[key] === 'function') {

                        }
                    }
                }
            }
        };
        
        var watchers = watcherMap[this.id];
        watchers.forEach(function (watcher) {
            var property = this.propertyChanges[watcher.propertyName];
            if (property !== watcher.lastValue) {
                //   watcher.change(property);
            }
            if(!this.syncId) {
                var syncObject = syncify(this);
            } else {
                var changes = {syncId: this.syncId, changes: this.propertyChanges.map(syncify)};
            }
            var type = typeof property;
            if (property && type === 'object' || type === 'function') {
                if (!property.syncId) {
                    //syncify marks an object as synced and returns a new sync object (2 different operations)
                    //this allows webworker to work with values!
                    //when webworker decompresses change list, it traverses objects looking for syncIds
                    var syncObject = syncify(property);
                } else {

                }
            }

        });

        //templateThread.postMessage(MessageType.PropertiesChanged, {
        //    properties: properties,
        //    id: this.id
        //});
    }
}

var feedBack = function (template, changes) {

};

var process = function (id, changes) {

};

//goals: add/remove observers && find dirty template elements / attributes && compute style / transform changes


//var process = function(id, changes) {
//    var properties = observedObjects[id];
//    changes.forEach(function(change) {
//        var chains = properties[change];
//        chains.forEach(function(chain) {
//
//        });
//        if(chains.length === 0) {
//            delete properties[change];
//        }
//    });
//};

//{{aircraft.wings.left}}
//compiles to aircraft_wings_left

//templateInterface.aircraft = aircraft;
//aircraft.wings.left = new Wing();

//event: set aircraft
//know which aircraft properties I care about
//aircraft.observe(wings).observe(left)
//aircraft.wings = {left, right}


class TemplateBlock {
    public uniqueBlockId : number;
    public watchedVariables : Array<string> = [];
    public isRendered : boolean = false;
    public parentBlockUniqueId : number;

    private parentBlock : TemplateBlock = null;
    private static idGenerator = -1;
    private elementReferences : Array<HTMLElement> = [];
    private dirtyElementIndices : Array<Number> = [];
    private dirtyAttributeIndices : Array<Number> = [];

    constructor() {
        this.uniqueBlockId = TemplateBlock.idGenerator++;
    }
}