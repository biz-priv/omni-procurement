const AWS = require('aws-sdk');
const glue = new AWS.Glue();

module.exports.handler = async (event, context) => {
    try {
        console.log("event",event)
        const jobName = 'sample';
        const startJobResponse = await glue.startJobRun({ JobName: jobName }).promise();
        console.log('Glue job started successfully:', startJobResponse.JobRunId);
        return 'Glue job triggered successfully';
    } catch (error) {
        console.error('Failed to start the Glue job:', error);
    }
};
