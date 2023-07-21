const AWS = require('aws-sdk');
const glue = new AWS.Glue();

module.exports.handler = async (event, context) => {
    try {
        console.log("event", JSON.stringify(event));
        const bucketName = event.Records[0].s3.bucket.name;
        const objectKey = event.Records[0].s3.object.key;
        const prefixPath = objectKey.substring(0, objectKey.lastIndexOf('/') + 1);
        const fileName = objectKey.substring(objectKey.lastIndexOf('/') + 1);

        if (fileName.includes("Concur_Open_Invoices_RM")) {
            const startOpenInvoicesJobResponse = await glue.startJobRun({
                JobName: process.env.OPEN_INVOICES_GLUEJOB_NAME,
                Arguments: {
                    '--BUCKET_NAME': bucketName,
                    '--PREFIX_PATH': prefixPath,
                    '--DEST_FOLDER_NAME': process.env.ARCHIVE_FOLDER_NAME,
                },
            }).promise();
            console.log('Open Invoices Glue job started successfully:', startOpenInvoicesJobResponse.JobRunId);
        }
        else if (fileName.includes("Ap_Transactions")) {
            const startApTransactionsJobResponse = await glue.startJobRun({
                JobName: process.env.AP_TRANSACTION_GLUEJOB_NAME,
                Arguments: {
                    '--BUCKET_NAME': bucketName,
                    '--PREFIX_PATH': prefixPath,
                    '--DEST_FOLDER_NAME': process.env.ARCHIVE_FOLDER_NAME,
                },
            }).promise();
            console.log('Ap Transactions Glue job started successfully:', startApTransactionsJobResponse.JobRunId);
        } else if (fileName.includes("Vendor_Type")) {
            const startVendorTypeJobResponse = await glue.startJobRun({
                JobName: process.env.VENDOR_TYPE_GLUEJOB_NAME,
                Arguments: {
                    '--BUCKET_NAME': bucketName,
                    '--PREFIX_PATH': prefixPath,
                    '--DEST_FOLDER_NAME': process.env.ARCHIVE_FOLDER_NAME,
                },
            }).promise();
            console.log('Vendor Type Glue job started successfully:', startVendorTypeJobResponse.JobRunId);
        } else if (fileName.includes("Critical_Supplier")) {
            const startCrititcalSupplierJobResponse = await glue.startJobRun({
                JobName: process.env.CRITICAL_SUPPLIER_GLUEJOB_NAME,
                Arguments: {
                    '--BUCKET_NAME': bucketName,
                    '--PREFIX_PATH': prefixPath,
                    '--DEST_FOLDER_NAME': process.env.ARCHIVE_FOLDER_NAME,
                },
            }).promise();
            console.log('Crititcal Supplier Glue job started successfully:', startCrititcalSupplierJobResponse.JobRunId);
        } else if (fileName.includes("invoice_Status_Volume")) {
            const startinvoiceStatusAndVolumeJobResponse = await glue.startJobRun({
                JobName: process.env.INVOICE_STATUS_VOLUME_GLUEJOB_NAME,
                Arguments: {
                    '--BUCKET_NAME': bucketName,
                    '--PREFIX_PATH': prefixPath,
                    '--DEST_FOLDER_NAME': process.env.ARCHIVE_FOLDER_NAME,
                },
            }).promise();
            console.log('Concur Invoice Status and Volume Glue job started successfully:', startinvoiceStatusAndVolumeJobResponse.JobRunId);
        }
        else {
            return 'Glue job Not triggered successfully';
        }
    } catch (error) {
        console.error('Failed to start the Glue job:', error);
    }
};
