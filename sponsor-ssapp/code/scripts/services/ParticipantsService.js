import ConsentsService from '../services/ConsentsService.js';
import { participantConsentStatusEnum, senderType } from '../constants/participant.js';
import getSharedStorage from './SharedDBStorageService.js';
import DSUServiceAsync from './DSUServiceAsync.js';

export default class ParticipantsService extends DSUServiceAsync {
  PARTICIPANTS_TABLE = 'participants';
  PARTICIPANTS_PATH = '/participants';
  PARTICIPANT_LIST_FILENAME = 'participants.json';

  constructor(DSUStorage) {
    super(DSUStorage, '/consents');
    this.storageService = getSharedStorage(DSUStorage);
    this.DSUStorage = DSUStorage;
    this.consentsService = new ConsentsService(this.DSUStorage);
  }

  // TODO: catch error only upper level and show pop up
  async getTrialParticipants(trialKeySSI) {
    try {
      let result = null;
      try {
        result = await this.storageService.filter(this.getTableName(trialKeySSI));
      } catch (e) {
        result = undefined;
      }

      if (result && result.length > 0) {
        return result.filter((x) => !x.deleted);
      } else return [];
    } catch (error) {
      console.log(error.message);
    }
  }

  async updateParticipant(data, trialKeySSI) {
    try {
      const consent = await this.consentsService.getConsent(data.consentSSI);

      if (!consent) {
        throw new Error('Consent not found!');
      }

      let list = await this.getTrialParticipants(trialKeySSI);

      let participantExists = await this.storageService.filter(
        this.getTableName(trialKeySSI),
        `participantId == ${data.participantId}`
      );

      if (participantExists && participantExists.length === 1) {
        let participant = participantExists[0];

        participant = {
          ...participant,
          consentName: consent.name,
          consentVersion: consent.version,
          consentStatus: participantConsentStatusEnum.Consent,
          patientSignature: data.type === senderType.Patient ? data.operationDate : participant.patientSignature,
          doctorSignature: data.type === senderType.HCP ? data.operationDate : participant.doctorSignature,
        };

        await this.storageService.updateRecord(this.getTableName(trialKeySSI), data.participantId, participant);
      } else {
        const model = {
          participantId: data.participantId,
          consentName: consent.name,
          consentVersion: consent.version,
          consentStatus: participantConsentStatusEnum.Consent,
          patientSignature: data.type === senderType.Patient ? data.operationDate : null,
          doctorSignature: data.type === senderType.HCP ? data.operationDate : null,
        };

        await this.storageService.insertRecord(this.getTableName(trialKeySSI), data.participantId, model);
      }

      list = await this.getTrialParticipants(trialKeySSI);

      return list;
    } catch (error) {
      console.log(error.message);
    }
  }

  getTableName(trialKeySSI) {
    return this.PARTICIPANTS_TABLE + '_' + trialKeySSI;
  }
}