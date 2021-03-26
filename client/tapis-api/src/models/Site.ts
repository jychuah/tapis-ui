/* tslint:disable */
/* eslint-disable */
/**
 * Tenants API
 * Manage Tapis Tenants.
 *
 * The version of the OpenAPI document: 1
 * Contact: cicsupport@tacc.utexas.edu
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface Site
 */
export interface Site {
    /**
     * The unique identifier for the site.
     * @type {string}
     * @memberof Site
     */
    site_id: string;
    /**
     * The base URL for the site.
     * @type {string}
     * @memberof Site
     */
    base_url?: string;
    /**
     * Whether the site is the primary site.
     * @type {boolean}
     * @memberof Site
     */
    primary?: boolean;
    /**
     * The list of services for this site.
     * @type {Array<string>}
     * @memberof Site
     */
    services: Array<string>;
    /**
     * The tenant base url template.
     * @type {string}
     * @memberof Site
     */
    tenant_base_url_template?: string;
    /**
     * Tenant ID of this site's tenant.
     * @type {string}
     * @memberof Site
     */
    site_admin_tenant_id: string;
}

export function SiteFromJSON(json: any): Site {
    return SiteFromJSONTyped(json, false);
}

export function SiteFromJSONTyped(json: any, ignoreDiscriminator: boolean): Site {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'site_id': json['site_id'],
        'base_url': !exists(json, 'base_url') ? undefined : json['base_url'],
        'primary': !exists(json, 'primary') ? undefined : json['primary'],
        'services': json['services'],
        'tenant_base_url_template': !exists(json, 'tenant_base_url_template') ? undefined : json['tenant_base_url_template'],
        'site_admin_tenant_id': json['site_admin_tenant_id'],
    };
}

export function SiteToJSON(value?: Site | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'site_id': value.site_id,
        'base_url': value.base_url,
        'primary': value.primary,
        'services': value.services,
        'tenant_base_url_template': value.tenant_base_url_template,
        'site_admin_tenant_id': value.site_admin_tenant_id,
    };
}


