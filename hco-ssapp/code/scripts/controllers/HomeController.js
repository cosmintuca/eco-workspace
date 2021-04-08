import CommunicationService from "./services/CommunicationService.js";
import NotificationsService from "./services/NotificationsService.js";
import TrialService from "./services/TrialService.js";

const {WebcController} = WebCardinal.controllers;

const initialTrialModel = {
    title: {
        name: 'trial',
        label: 'Trial',
        value: 'Trial1',
    },
    date: {
        name: 'date',
        label: 'Date',
        value: 'dd.mm.yyyy',
    },
    description: {
        name: 'description',
        label: 'Description',
        value: 'Loren ipsum test test test test test test 1 ',
    }
}


const initModel = {
    title: 'HomePage',
    trials: [

    ],
    trialsModel: JSON.parse(JSON.stringify(initialTrialModel))
}

export default class HomeController extends WebcController {
    constructor(element, history) {
        super(element, history);

        this.setModel(initModel);
        this.NotificationsService = new NotificationsService(this.DSUStorage);

        this.TrialService = new TrialService(this.DSUStorage);
        this.TrialService.getServiceModel((err, data) => {
            if(err) {
                return console.error(err);
            }
            this.model.trials = data.trials;
        })
        this.CommunicationService = CommunicationService.getInstance(CommunicationService.identities.HCO_IDENTITY);
        this.CommunicationService.listenForMessages((err, data) => {
            
            if(err) {
                return console.error(err);
            }
            data = JSON.parse(data);
            this.addMessageToNotificationDsu (data);

            this.TrialService.mountTrial(data.message.ssi,(err, trial) => {
                if (err) {
                    return console.log(err);
                }
                this.model.trials.push(trial);
            });
            this.addMessageToNotificationDsu(data);
        });

        this._attachHandlerTrialDetails();

    }



    _attachHandlerTrialDetails() {

        this.onTagEvent('home:trial', 'click', () => {
                console.log('button pressed ');
            this.navigateToPageTag('trial');
            }
        )
    }


    addMessageToNotificationDsu (message){

        this.NotificationsService.saveNotification( message.message,(err, notification) => {
            debugger;
            if (err) {
                console.log(err);
                return;
            }

            });
    }

}