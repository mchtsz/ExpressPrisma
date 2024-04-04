import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

const prisma = new PrismaClient();

app.post('/createPostAdr', async (req, res) => {
    const { Postnr, Poststed } = req.body;
    try {
        const post = await prisma.postadr.create({
            data: {
                Postnr: parseInt(Postnr),
                Poststed: Poststed
            }
        });
        res.send(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating the post' });
    }
});

app.post('/createAuthor', async (req, res) => {
    const { fornavn, etternavn, mail, passord, postID } = req.body;
    try {
        const jornalist = await prisma.jornalist.create({
            data: {
                fornavn: fornavn,
                etternavn: etternavn,
                mail: mail,
                passord: passord,
                post: {
                    connect: {
                        id: parseInt(postID)
                    }
                }
            }
        });
        res.send(jornalist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating the post' });
    }
});

app.listen(3000, () => {
    console.log(`Server running on port 3000`);
});