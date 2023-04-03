function resolvePromise(promise, promiseState, notifyObservers) {
    promiseState.promise = promise;
    promiseState.data = null;
    promiseState.error = null;

    if (notifyObservers) notifyObservers();
    function saveDataACB(result) {
        if (promiseState.promise !== promise) return;
        promiseState.data = result;
        if (notifyObservers) notifyObservers();
    }
    function saveErrorACB(err) {
        if (promiseState.promise !== promise) return;
        promiseState.error = err;

        if (notifyObservers) notifyObservers();
    }
    if (promise == null) return;

    promise.then(saveDataACB).catch(saveErrorACB);
}
export default resolvePromise;