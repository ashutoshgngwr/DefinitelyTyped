import Serverless from 'serverless';
import Plugin from 'serverless/classes/Plugin';
import PluginManager from 'serverless/classes/PluginManager';
import { getHttp } from 'serverless/plugins/aws/package/compile/events/apiGateway/lib/validate';

const options: Serverless.Options = {
    noDeploy: false,
    stage: null,
    region: '',
};

const serverless = new Serverless();

class CustomPlugin implements Plugin {
    commands = {
        command: {
            usage: 'description',
            lifecycleEvents: ['start'],
            options: {
                option: {
                    usage: `description`,
                    required: true,
                    shortcut: 'o',
                },
            },
        },
    };

    customProp = {};

    hooks: Plugin.Hooks;

    constructor(serverless: Serverless, options: Serverless.Options) {
        this.hooks = {
            'command:start': () => {},
        };
    }
}

// Test a plugin with missing 'hooks' property
// prettier-ignore
class BadPlugin implements Plugin { // $ExpectError
    hoooks: Plugin.Hooks; // emulate a bad 'hooks' definition with a typo
    constructor(badArg: number) {}
}

const manager = new PluginManager(serverless);
manager.addPlugin(CustomPlugin);
// Test adding a plugin with an incorrect constructor
// prettier-ignore
manager.addPlugin(BadPlugin); // $ExpectError

// Test provider's 'request' method
const provider = serverless.getProvider('aws');
provider.request('AccessAnalyzer', 'createAnalyzer');
provider.request('CloudFormation', 'deleteStack', {
    StackName: 'stack',
});
provider.request(
    'CloudFormation',
    'deleteStack',
    {
        StackName: 'stack',
    },
    {
        useCache: true,
        region: 'us-east-1',
    },
);

// Test ApiGateway validator
getHttp(
    {
        http: {
            path: 'myPath',
            method: 'get',
        },
    },
    'myFunction',
);
getHttp(
    {
        http: 'GET mypath',
    },
    'myFunction',
);
getHttp(
    {
        sqs: 'arn', // $ExpectError
    },
    'myFunction',
);
