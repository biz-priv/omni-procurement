const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const simpleParser = require("mailparser").simpleParser;
const moment = require('moment');



module.exports.handler = async (event) => {
    try {
        console.info(event.Records[0].s3.object.key);
        const bucket = event.Records[0].s3.bucket.name;
        const key = event.Records[0].s3.object.key;
        // const bucket = "omni-finance-receive-dev";
        // const key = "fr5jp43pjruceealk33dsir6itrc5m8hg2i3c201";
        const s3Data = await getS3Data(bucket, key);
        await parseMail(s3Data);
    } catch (err) {
        console.log("handler:error", err);
    }
    console.log("end of the code");
};

//Getting the object from s3 bucket to fetch the attachments.
const getS3Data = (bucket, key) => {
    return new Promise(async (resolve, reject) => {
        try {
            const params = {
                Bucket: bucket,
                Key: key,
            };
            const data = await s3.getObject(params).promise();
            console.log("getS3Data:", data);
            resolve(data);
        } catch (error) {
            console.log("getS3Data:error", error);
            reject(error);
        }
    });
};

//Fetching mail attachments from the copy of mail and converting buffer to xlsx
const parseMail = async (data) => {
    try {
        const mailData = await simpleParser(data.Body);
        console.log("attachment:", mailData.attachments.length, mailData.attachments);
        for (let index = 0; index < mailData.attachments.length; index++) {
            const element = mailData.attachments[index];
            console.log("element.filename:", element.filename);
            if (element.filename.includes(".csv")|| element.filename.includes(".xls")) {
                console.log("element.content:", element.content);
                const outputFilename = element.filename
                const fileContent = element.content
                await uploadFileToS3(outputFilename, fileContent);
            }
        }
    } catch (err) {
        console.log("parseMail:error", err);
    }
};


//Uploading specific files to specific folders in  S3
async function uploadFileToS3(outputFilename, fileContent) {
    console.log("uploadFileToS3")
    const openInvoicesOutputFilename= "Concur_Open_Invoices_RM_"+ moment().format('YYYY-MM-DD_HH:mm:ss')+".csv"
    const apTransactionsOutputFilename="Ap_Transactions_"+ moment().format('YYYY-MM-DD_HH:mm:ss')+".csv"
    const vendorTypeOutputFilename ="Vendor_Type_"+ moment().format('YYYY-MM-DD_HH:mm:ss')+".xlsx"
    const criticalSupplierOutputFilename ="Critical_Supplier_"+ moment().format('YYYY-MM-DD_HH:mm:ss')+".xlsx"
    const invoiceStatusAndVolumeOutputFilename= "invoice_Status_Volume"+ moment().format('YYYY-MM-DD_HH:mm:ss')+".xlsx"
    try {
        if (outputFilename.includes("Concur Open Invoices-RM")) {
            await s3
                .upload({
                    Bucket: process.env.S3_BUCKET_FOLDER_OPEN_INVOICE_RM,
                    Key: openInvoicesOutputFilename,
                    Body: fileContent,
                    ContentType: "application/octet-stream",
                })
                .promise();
        } else if (outputFilename.includes("APTransactionswithpostingstatusResults")) {
            await s3
                .upload({
                    Bucket: process.env.S3_BUCKET_FOLDER_AP_TRANSCTIONS,
                    Key: apTransactionsOutputFilename,
                    Body: fileContent,
                    ContentType: "application/octet-stream",
                })
                .promise();
        } else if (outputFilename.includes("Vendor Type")) {
            await s3
                .upload({
                    Bucket: process.env.S3_BUCKET_FOLDER_VENDOR_TYPE,
                    Key: vendorTypeOutputFilename,
                    Body: fileContent,
                    ContentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                })
                .promise();
        } else if (outputFilename.includes("Critical Supplier")) {
            await s3
                .upload({
                    Bucket: process.env.S3_BUCKET_FOLDER_CRITICAL_SUPPLIERS,
                    Key: criticalSupplierOutputFilename,
                    Body: fileContent,
                    ContentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                })
                .promise();
        } else if (outputFilename.includes("Concur Invoice Status & Volume")) {
            await s3
                .upload({
                    Bucket: process.env.S3_BUCKET_FOLDER_INVOICE_STATUS_VOLUME,
                    Key: invoiceStatusAndVolumeOutputFilename,
                    Body: fileContent,
                    ContentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                })
                .promise();
        }
    } catch (error) {
        console.log("error", error);
    }
}



