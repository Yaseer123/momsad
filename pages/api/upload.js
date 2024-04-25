import multiparty from 'multiparty';
import { PutObjectAclCommand, S3Client } from '@aws-sdk/client-s3';
const bucketName = "momsad-next-ecommerce"

export default async function handle(req, res) {
    const form = new multiparty.Form();
    const { fields, files } = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            resolve({ fields, files });
        });
    });
    console.log('length', files.file.length);
    // const client = new S3Client({
    //     region: 'eu-north-1',
    //     credentials:{
    //         accessKeyId:process.env.S3_ACCESS_KEY,
    //         secretAccess,Key:process.env.S3_SECRET_ACCESS_KEY
    //     },
    // });
    // client.send(new PutObjectAclCommand({
    //     Bucket:bucketName,
    // }))
    console.log(fields);
    return res.json('ok');
}

export const config = {
    api: { bodyParser: false },
};
