'use strict';

import { UserDAO } from './User';
import { TenantDAO } from './Tenant';
import { cleanUserProperty, setUserProperty, getUserProperty } from './cognito-user';

const uuid = require('uuid');

const PROPOSED_TENANT_ID = "custom:invitedTenantID";
const TENANT_NAME = "custom:tenantName";
const TENANT_ID = "custom:tenantID";
const FEDERATED_ID = "custom:federatedID";

export class TenantAssignmentModule {

    constructor(private userDAO: UserDAO, private tenantDAO: TenantDAO) {}

    setProposedNewTenant(userName, userPool, tenantName) {
        return setUserProperty(userName, userPool, TENANT_NAME, tenantName);
    }

    getProposedNewTenant(userName, userPool): Promise<string> {
        return getUserProperty(userName, userPool, TENANT_NAME);
    }

    cleanProposedNewTenant(userName, userPool) {
        return cleanUserProperty(userName, userPool, TENANT_NAME);
    }

    setProposedTenant(userName, userPool, tenantID) {
        return setUserProperty(userName, userPool, PROPOSED_TENANT_ID, tenantID);
    }

    getProposedTenant(userName, userPool): Promise<string> {
        return getUserProperty(userName, userPool, PROPOSED_TENANT_ID);
    }

    cleanProposedTenant(userName, userPool) {
        return cleanUserProperty(userName, userPool, PROPOSED_TENANT_ID);
    }

    setTenant(userName, userPool, tenantID) {
        return setUserProperty(userName, userPool, TENANT_ID, tenantID);
    }

    getTenant(userName, userPool) {
        return getUserProperty(userName, userPool, TENANT_ID);
    }

    setUserID(userName, userPool, userID) {
        return setUserProperty(userName, userPool, FEDERATED_ID, userID);
    }

    getUserID(userName, userPool) {
        return getUserProperty(userName, userPool, FEDERATED_ID);
    }

    async acceptNewTenant(federatedUserID, userName, userPool) {
        const tenantName = await this.getProposedNewTenant(userName, userPool);
        console.log("proposed tenant name: %s", tenantName);
        if (!tenantName) {
            return(null);
        } else {
            const tenantId = uuid.v4();
            await this.tenantDAO.createTenant(tenantId, tenantName);
            await this.userDAO.createUser(tenantId, federatedUserID, userName);
            await this.cleanProposedNewTenant(userName, userPool);
            await this.setTenant(userName, userPool, tenantId);
            await this.setUserID(userName, userPool, federatedUserID);
            return tenantId;
        }
    }

    async acceptTenant(federatedUserID, userName, userPool) {
        const tenantId = await this.getProposedTenant(userName, userPool);
        if (!tenantId) {
            return(null);
        } else {
            await this.userDAO.createUser(tenantId, federatedUserID, userName);
            await this.cleanProposedTenant(userName, userPool);
            await this.setTenant(userName, userPool, tenantId);
            await this.setUserID(userName, userPool, federatedUserID);
            return tenantId;
        }
    }

}

