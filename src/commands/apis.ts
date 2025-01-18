import {google} from 'googleapis';
import open from 'open';

import {PUBLIC_ADVANCED_SERVICES} from '../apis.js';
<<<<<<< HEAD
<<<<<<< HEAD

import {Command} from 'commander';
import {OAuth2Client} from 'google-auth-library';
import {ClaspError} from '../clasp-error.js';
import {Context, assertAuthenticated, assertScriptSettings} from '../context.js';
import {enableOrDisableAdvanceServiceInManifest} from '../manifest.js';
import {ERROR} from '../messages.js';
import {URL} from '../urls.js';
import {checkIfOnlineOrDie, getOrPromptForProjectId} from '../utils.js';

type CommandOptions = {
  context: Context;
};
=======
import {enableOrDisableAPI, getAuthorizedOAuth2ClientOrDie} from '../apiutils.js';
=======
import {getAuthorizedOAuth2ClientOrDie} from '../auth.js';
>>>>>>> d81ed68 (chore: Additional refactoring to improve locality/readability)

import {OAuth2Client} from 'google-auth-library';
import {ClaspError} from '../clasp-error.js';
import {enableOrDisableAdvanceServiceInManifest} from '../manifest.js';
import {ERROR} from '../messages.js';
import {URL} from '../urls.js';
import {checkIfOnlineOrDie, getProjectId} from '../utils.js';

>>>>>>> 1ae3ded (fix: Improve consistency of command checks & error messages)
type Service = {
  id: string;
  name: string;
  description: string;
};
<<<<<<< HEAD

/**
 * Opens the Google Cloud Console for the project.
 */
export async function openApisCommand(this: Command, options: CommandOptions) {
  const context = options.context;
  assertScriptSettings(context);

  const projectId = await getOrPromptForProjectId(context.project);

=======

/**
 * Opens the Google Cloud Console for the project.
 */
export async function openApisCommand() {
  const projectId = await getProjectId();
>>>>>>> 1ae3ded (fix: Improve consistency of command checks & error messages)
  const apisUrl = URL.APIS(projectId);
  console.log(apisUrl);
  await open(apisUrl, {wait: false});
}

/**
 * Lists all APIs available to the user and shows which ones are enabled.
 */
<<<<<<< HEAD
export async function listApisCommand(this: Command) {
  await checkIfOnlineOrDie();

  const context: Context = this.opts().context;
  console.log(context);
  assertAuthenticated(context);
  assertScriptSettings(context);

  const projectId = await getOrPromptForProjectId(context.project);

  const printService = (service: Service) =>
    console.log(`${service.name.padEnd(25)} - ${service.description.padEnd(60)}`);

  console.log('\n# Currently enabled APIs:');
  const enabledApis = await getEnabledApis(context.credentials, projectId);
  enabledApis.forEach(printService);

  console.log('\n# List of available APIs:');
  const availableApis = await getAvailableApis();
  availableApis.forEach(printService);
}

/**
 * Enable a service.
 *
 * @param serviceName The name of the service to enable
 */
export async function enableApiCommand(this: Command, serviceName: string) {
  await checkIfOnlineOrDie();

  const context: Context = this.opts().context;
  assertAuthenticated(context);
  assertScriptSettings(context);

  const projectId = await getOrPromptForProjectId(context.project);
  context.project.settings.projectId = projectId;

  await enableOrDisableAPI(context, serviceName, true);
}

/**
 * Disable a service.
 *
 * @param serviceName The name of the service to disable
 */
export async function disableApiCommand(this: Command, serviceName: string) {
  await checkIfOnlineOrDie();

  const context: Context = this.opts().context;
  assertAuthenticated(context);
  assertScriptSettings(context);

  const projectId = await getOrPromptForProjectId(context.project);
  context.project.settings.projectId = projectId;
  await enableOrDisableAPI(context, serviceName, false);
}

/**
 * Fetch the enabled APIs for the given project.
 *
 * @param projectId project to get APIs for
 * @param oauth2Client authorized oauth2 client
 * @returns list of enabled APIs
 */
async function getEnabledApis(oauth2Client: OAuth2Client, projectId: string): Promise<Array<Service>> {
  const serviceUsage = google.serviceusage({version: 'v1', auth: oauth2Client});

  const list = await serviceUsage.services.list({
    parent: `projects/${projectId}`,
    filter: 'state:ENABLED',
    pageSize: 200,
  });
  const serviceList = list.data.services ?? [];

  // Filter out the disabled ones. Print the enabled ones.
  const truncateName = (name: string) => name.slice(0, name.indexOf('.'));
  return serviceList
    .filter(service => service.state === 'ENABLED')
    .map(service => ({
      id: service.name ?? '',
      name: truncateName(service.config?.name ?? 'Unknown name'),
      description: service.config?.documentation?.summary ?? '',
    }));
}

/**
 * Fetch the available APIs for the given project.
 *
 * @returns list of available APIs
 */
async function getAvailableApis(): Promise<Array<Service>> {
  const discovery = google.discovery({version: 'v1'});

  const {data} = await discovery.apis.list({
    preferred: true,
  });

  const allServices = data.items ?? [];
  return PUBLIC_ADVANCED_SERVICES.map(service => allServices.find(s => s?.name === service.serviceId))
    .filter((service): service is Service => service?.id !== undefined && service?.description !== undefined)
    .sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Enables or disables a Google API.
 * @param {string} serviceName The name of the service. i.e. sheets
 * @param {boolean} enable Enables the API if true, otherwise disables.
 */
export async function enableOrDisableAPI(context: Context, serviceName: string, enable: boolean): Promise<void> {
  assertScriptSettings(context);

  if (!serviceName) {
    throw new ClaspError('An API name is required. Try sheets');
  }

  const serviceUsage = google.serviceusage({version: 'v1', auth: context.credentials});

  const name = `projects/${context.project.settings.projectId}/services/${serviceName}.googleapis.com`;
  try {
    await (enable ? serviceUsage.services.enable({name}) : serviceUsage.services.disable({name}));
    await enableOrDisableAdvanceServiceInManifest(context.project.contentDir, serviceName, enable);
    console.log(`${enable ? 'Enable' : 'Disable'}d ${serviceName} API.`);
  } catch (error) {
    if (error instanceof ClaspError) {
      throw error;
    }

    // If given non-existent API (like fakeAPI, it throws 403 permission denied)
    // We will log this for the user instead:
    console.log(error);

    throw new ClaspError(ERROR.NO_API(enable, serviceName));
  }
}
=======
export async function listApisCommand() {
  await checkIfOnlineOrDie();

  const oauth2Client = await getAuthorizedOAuth2ClientOrDie();
  const projectId = await getProjectId(); // Will prompt user to set up if required

  const printService = (service: Service) =>
    console.log(`${service.name.padEnd(25)} - ${service.description.padEnd(60)}`);

  console.log('\n# Currently enabled APIs:');
  const enabledApis = await getEnabledApis(oauth2Client, projectId);
  enabledApis.forEach(printService);

  console.log('\n# List of available APIs:');
  const availableApis = await getAvailableApis();
  availableApis.forEach(printService);
}

/**
 * Enable a service.
 *
 * @param serviceName The name of the service to enable
 */
export async function enableApiCommand(serviceName: string) {
  await checkIfOnlineOrDie();

  const oauth2Client = await getAuthorizedOAuth2ClientOrDie();
  const projectId = await getProjectId(); // Will prompt user to set up if required

  await enableOrDisableAPI(oauth2Client, projectId, serviceName, true);
}

/**
 * Disable a service.
 *
 * @param serviceName The name of the service to disable
 */
export async function disableApiCommand(serviceName: string) {
  await checkIfOnlineOrDie();

  const oauth2Client = await getAuthorizedOAuth2ClientOrDie();
  const projectId = await getProjectId(); // Will prompt user to set up if required
  await enableOrDisableAPI(oauth2Client, projectId, serviceName, false);
}

/**
 * Fetch the enabled APIs for the given project.
 *
 * @param projectId project to get APIs for
 * @param oauth2Client authorized oauth2 client
 * @returns list of enabled APIs
 */
async function getEnabledApis(oauth2Client: OAuth2Client, projectId: string): Promise<Array<Service>> {
  const serviceUsage = google.serviceusage({version: 'v1', auth: oauth2Client});

  const list = await serviceUsage.services.list({
    parent: `projects/${projectId}`,
    filter: 'state:ENABLED',
    pageSize: 200,
  });
  const serviceList = list.data.services ?? [];

  // Filter out the disabled ones. Print the enabled ones.
  const truncateName = (name: string) => name.slice(0, name.indexOf('.'));
  return serviceList
    .filter(service => service.state === 'ENABLED')
    .map(service => ({
      id: service.name ?? '',
      name: truncateName(service.config?.name ?? 'Unknown name'),
      description: service.config?.documentation?.summary ?? '',
    }));
}

/**
 * Fetch the available APIs for the given project.
 *
 * @returns list of available APIs
 */
async function getAvailableApis(): Promise<Array<Service>> {
  const discovery = google.discovery({version: 'v1'});

  const {data} = await discovery.apis.list({
    preferred: true,
  });

  const allServices = data.items ?? [];
  return PUBLIC_ADVANCED_SERVICES.map(service => allServices.find(s => s?.name === service.serviceId))
    .filter((service): service is Service => service?.id !== undefined && service?.description !== undefined)
    .sort((a, b) => a.id.localeCompare(b.id));
}
<<<<<<< HEAD
>>>>>>> 1ae3ded (fix: Improve consistency of command checks & error messages)
=======

/**
 * Enables or disables a Google API.
 * @param {string} serviceName The name of the service. i.e. sheets
 * @param {boolean} enable Enables the API if true, otherwise disables.
 */
export async function enableOrDisableAPI(
  oauth2Client: OAuth2Client,
  projectId: string,
  serviceName: string,
  enable: boolean,
): Promise<void> {
  if (!serviceName) {
    throw new ClaspError('An API name is required. Try sheets');
  }

  const serviceUsage = google.serviceusage({version: 'v1', auth: oauth2Client});

  const name = `projects/${projectId}/services/${serviceName}.googleapis.com`;
  try {
    await (enable ? serviceUsage.services.enable({name}) : serviceUsage.services.disable({name}));
    await enableOrDisableAdvanceServiceInManifest(serviceName, enable);
    console.log(`${enable ? 'Enable' : 'Disable'}d ${serviceName} API.`);
  } catch (error) {
    if (error instanceof ClaspError) {
      throw error;
    }

    // If given non-existent API (like fakeAPI, it throws 403 permission denied)
    // We will log this for the user instead:
    console.log(error);

    throw new ClaspError(ERROR.NO_API(enable, serviceName));
  }
}
>>>>>>> d81ed68 (chore: Additional refactoring to improve locality/readability)
