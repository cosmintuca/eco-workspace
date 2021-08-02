import NotificationsRepository from "../repositories/VisitsAndProceduresRepository.js";

const {WebcController} = WebCardinal.controllers;
import VisitsAndProceduresRepository from "../repositories/VisitsAndProceduresRepository.js";
import TrialParticipantRepository from '../repositories/TrialParticipantRepository.js';
import DateTimeService from '../services/DateTimeService.js';

import CommunicationService from "../services/CommunicationService.js";
import Constants from "../utils/Constants.js";

let getInitModel = () => {
    return {
        visits: []
    };
};

export default class VisitsAndProceduresController extends WebcController {
    constructor(...props) {
        super(...props);
        this.setModel({
            ...getInitModel(),
            ...this.history.win.history.state.state,
            visits: []
        });
        ;
        this._initServices(this.DSUStorage);
        this._initHandlers();
        this._initVisits();
    }

    _initHandlers() {
        this._attachHandlerBack();
        this._attachHandlerDetails();
        this._attachHandlerSetDate();
    }

    _initServices(DSUStorage) {
        this.VisitsAndProceduresRepository = VisitsAndProceduresRepository.getInstance(DSUStorage);
        this.TrialParticipantRepository = TrialParticipantRepository.getInstance(DSUStorage);
        this.CommunicationService = CommunicationService.getInstance(CommunicationService.identities.ECO.HCO_IDENTITY);
    }

    async _initVisits() {

        this.model.visits = await this.VisitsAndProceduresRepository.findAllAsync();
        if (this.model.visits && this.model.visits.length > 0) {
            this.model.tp = await this.TrialParticipantRepository.findByAsync(this.model.tpUid);
            if (!this.model.tp.visits || this.model.tp.visits.length < 1) {
                this.model.tp.visits = this.model.visits;
                this._updateTrialParticipant();
                return;
            } else {
                this.model.visits.forEach(visit => {

                    let visitTp = this.model.tp.visits.filter(v => v.uid === visit.uid)[0];
                    visit.confirmed = visitTp.confirmed;
                    visit.date = visitTp.date;
                })
            }
        }

    }

    _updateTrialParticipantVisit(visit) {
        if (!this.model.tp.visits)
            this.model.tp.visits = this.visits;

        let objIndex = this.model.tp.visits.findIndex((obj => obj.uid == visit.uid));
        this.model.tp.visits[objIndex] = visit;
        this.TrialParticipantRepository.updateAsync(this.model.tp.uid, this.model.tp);
        this.sendMessageToPatient(visit);
    }

    _updateTrialParticipant() {
        this.model.tp.visits = this.model.visits;
        this.TrialParticipantRepository.updateAsync(this.model.tp.uid, this.model.tp);
    }

    _attachHandlerBack() {
        this.onTagEvent('back', 'click', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            window.history.back();
        });
    }

    _attachHandlerDetails() {
        this.onTagEvent('viewConsent', 'click', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            debugger;
            this.navigateToPageTag('econsent-sign', {
                trialSSI: model.trialSSI,
                econsentSSI: model.consentSSI,
                controlsShouldBeVisible: false
            });

        });
    }

    _attachHandlerSetDate() {
        this.onTagEvent('procedure:setDate', 'click', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.showModalFromTemplate(
                'set-procedure-date',
                (event) => {

                    let date = new Date();
                    date.setTime(event.detail);
                    model.date = date.toISOString(),
                        this._updateVisit(model);
                    this._updateTrialParticipantVisit(model);
                },
                (event) => {
                    const response = event.detail;
                }
            ),
                {
                    controller: 'SetProcedureDateController',
                    disableExpanding: false,
                    disableBackdropClosing: false,
                    title: 'Set Procedure Date',
                };
        });
    }

    _updateVisit(visit) {
        let objIndex = this.model.visits.findIndex((obj => obj.uid == visit.uid));
        this.model.visits[objIndex] = visit;
    }

    sendMessageToPatient(visit) {

        this.CommunicationService.sendMessage(CommunicationService.identities.ECO.PATIENT_IDENTITY, {
            operation: Constants.MESSAGES.HCO.COMMUNICATION.TYPE.SCHEDULE_VISIT,
            ssi: visit.trialSSI,
            useCaseSpecifics: {
                tpDid: this.model.tp.did,
                trialSSI: visit.trialSSI,

                visit: {
                    name: visit.name,
                    period: visit.period,
                    consentSSI: visit.consentSSI,
                    date: visit.date,
                },
            },
            shortDescription: Constants.MESSAGES.HCO.COMMUNICATION.PATIENT.SCHEDULE_VISIT ,
        });
    }


}