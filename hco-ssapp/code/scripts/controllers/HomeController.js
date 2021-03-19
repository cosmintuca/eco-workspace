import ContainerController from '../../../cardinal/controllers/base-controllers/ContainerController.js';

const initialTrialModel = {
    title: {
        name: 'trial',
        label: 'Trial',
        value: 'Trial1',
    },
    date:{
        name: 'date',
        label: 'Date',
        value: 'dd.mm.yyyy',
    },
    description:{
        name: 'description',
        label: 'Description',
        value: 'Loren ipsum test test test test test test 1 ',
    }
}


const initModel = {
    title: 'HomePage',
    trials: [
        {
            id: 1,
            title: 'Trial 1',
            date: '11.mm.yyyy',
            description : 'trial 1Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris ',
            initTrialModel:  JSON.parse(JSON.stringify(initialTrialModel))

        },
        {
            id: 2,
            title: 'Trial 2',
            date: '22.mm.yyyy',
            description : 'Trial 2 Description Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris ',
            initTrialModel:  JSON.parse(JSON.stringify(initialTrialModel))
        },
        {
            id: 3,
            title: 'Trial 3',
            date: '33.mm.yyyy',
            description : 'Trial 3 Description Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris ',
            initTrialModel:  JSON.parse(JSON.stringify(initialTrialModel))
        },
    ],
    trialsModel: JSON.parse(JSON.stringify(initialTrialModel))
}

export default class HomeController extends ContainerController {
    constructor(element, history) {
        super(element, history);
        this._attachHandlerCreateTrial();
        this._attachHandlerClinics();
        this._attachHandlerTrialDetails();
        this.model= this.setModel(initModel);
    }

    _attachHandlerCreateTrial(){
        this.on('home:trial', (event) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.History.navigateToPageByTag('create-trial');
        });
    }
    _attachHandlerTrialDetails(){
        this.on('home:trialDetails', (event) => {
            console.log ("Button pressed");
            const id = event.data;
            const trialIndex = this.model.trials.findIndex((trial) => trial.id === id);
            if (trialIndex === -1) {
                console.log('trial not found @id', id, this.model.trials);
                return;
            }

            const trialDetails = this.model.trials[trialIndex];
            this.showModal('trialDetails', trialDetails, (err, data) => {
                if (err) {
                    console.log(err);
                    return;
                }

            })

        });
    }


    _attachHandlerClinics(){
        this.on('home:clinics', (event) => {
            console.log ("Button 2 pressed");
        });
    }
}