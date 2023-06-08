const AWS = require('aws-sdk');
const glue = new AWS.Glue();

module.exports.handler = async (event, context) => {
    try {
        console.log("event", event)
        console.log("event", event.Records[0].s3)
        const bucketName = event.Records[0].s3[0].bucket.name;
        const objectKey = event.Records[0].s3[0].object.key;

        console.log('Bucket Name:', bucketName);
        console.log('Object Key:', objectKey);
        const jobName = 'sample';
        const glueParams = {
            JobName: jobName,
            Arguments: {
                '--input': `s3://${bucketName}/${objectKey}`,
            },
        };
        console.log("glueParams", glueParams)
        const startJobResponse = await glue.startJobRun(glueParams).promise();
        console.log('Glue job started successfully:', startJobResponse.JobRunId);
        return 'Glue job triggered successfully';
    } catch (error) {
        console.error('Failed to start the Glue job:', error);
    }
};
