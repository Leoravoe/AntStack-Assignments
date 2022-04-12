exports.handler = async (event, context) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));
    
    let body;
    let statusCode = '200';
    const headers = {
        'Content-Type': 'application/json',
    };
    const {secretKey} = JSON.parse(event.body)
    const encryptor = require('simple-encryptor')(secretKey);
    
    try {
        switch (true) {
            case event.httpMethod == 'POST' && event.path == '/encrypt':
                const {encryptText} = JSON.parse(event.body);
                const encrypted = encryptor.encrypt(encryptText);
                body = {
                    encryptedText: encrypted
                }
                break;
            case event.httpMethod == 'POST' && event.path == '/decrypt':
                const {hashText} = JSON.parse(event.body);
                const decrypted = encryptor.decrypt(hashText);
                if(decrypted)
                    body = {
                        decryptedText : decrypted
                    }
                else{
                    body = {
                        message : "Wrong key"
                    }
                }
                break;
            default:
                throw new Error(`Unsupported method "${event.httpMethod}"`);
        }
    } catch (err) {
        statusCode = '400';
        body = err.message;
    } finally {
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers,
    };
};
