import multiparty from 'multiparty';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { createReadStream } from 'fs';
import mime from 'mime-types';

const bucketName = 'momsad-next-ecommerce';

export default async function handle(req, res) {
    const form = new multiparty.Form();
    const { files } = await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ files });
    });
    });

    const client = new S3Client({
        region: 'eu-north-1', // Update the region to match your bucket's region
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        },
        });

    const links = [];

    for (const file of files.file) {
    const ext = file.originalFilename.split('.').pop();
    const newFilename = Date.now() + '.' + ext;

    try {
        await client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: newFilename,
        Body: createReadStream(file.path),
        ACL: 'public-read',
        ContentType: mime.lookup(file.headers['content-type']),
        }));
        const link = `https://${bucketName}.s3.amazonaws.com/${newFilename}`;
        links.push(link);
    } catch (error) {
        console.error('Error uploading file:', error);
    }
    }

    return res.json({ links });
}

export const config = {
    api: { bodyParser: false },
};
