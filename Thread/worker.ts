self.onmessage = function(messageEvent) {
    var message = messageEvent.data;
    console.log(message);
    postMessage('hi', null)
};

