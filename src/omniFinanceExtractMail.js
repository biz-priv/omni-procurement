const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const simpleParser = require("mailparser").simpleParser;
const moment = require('moment');



module.exports.handler = async (event) => {
    try {
        // console.info(event.Records[0].s3.object.key);
        const bucket = "omni-finance-receive-dev";
        const key = "fr5jp43pjruceealk33dsir6itrc5m8hg2i3c201";
        // const bucket = event.Records[0].s3.bucket.name;
        // const key = event.Records[0].s3.object.key;
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
    const filename = outputFilename.slice(0, -4) + "_" + moment().format('YYYY-MM-DD_HH:mm:ss') + outputFilename.slice(-4)
    console.log(filename)
    try {
        if (outputFilename.includes("Concur_open_invoices_rm")) {
            await s3
                .upload({
                    Bucket: process.env.S3_BUCKET_FOLDER_OPEN_INVOICE_RM,
                    Key: filename,
                    Body: fileContent,
                    ContentType: "application/octet-stream",
                })
                .promise();
        } else if (outputFilename.includes("Netsuite_ap_transactions")) {
            await s3
                .upload({
                    Bucket: process.env.S3_BUCKET_FOLDER_AP_TRANSCTIONS,
                    Key: outputFilename,
                    Body: fileContent,
                    ContentType: "application/octet-stream",
                })
                .promise();
        } else if (outputFilename.includes("Netsuite_vendor_type")) {
            await s3
                .upload({
                    Bucket: process.env.S3_BUCKET_FOLDER_VENDOR_TYPE,
                    Key: outputFilename,
                    Body: fileContent,
                    ContentType: "application/vnd.ms-excel",
                })
                .promise();
        } else if (outputFilename.includes("Concur_critical_suppliers")) {
            await s3
                .upload({
                    Bucket: process.env.S3_BUCKET_FOLDER_CRITICAL_SUPPLIERS,
                    Key: outputFilename,
                    Body: fileContent,
                    ContentType: "application/vnd.ms-excel",
                })
                .promise();
        }
    } catch (error) {
        console.log("error", error);
    }
}



