const {WebcController} = WebCardinal.controllers;

export default class TrialController extends WebcController {
    constructor(element, history) {
        super(element, history);
        let trialId = this.history.win.history.state.state;
    }
}