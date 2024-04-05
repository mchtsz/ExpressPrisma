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
        res.json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating the post' });
    }
});

app.post('/createAuthor', async (req, res) => {
    const { fornavn, etternavn, mail, passord, postID } = req.body;
    try {
        const journalist = await prisma.journalist.create({
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
        res.json(journalist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating the post' });
    }
});

app.post('/createArticle', async (req, res) => {
    const { title, content, views, updateAt, journalist } = req.body;

    const j = await prisma.journalist.findFirst({
        where: {
            fornavn: {
                startsWith: journalist
            }
        }
    })
    if (!j) {
        return
    }
    const artikkel = await prisma.artikkel.create({
        data: {
            title: title,
            content: content,
            views: parseInt(views),
            updateAt: new Date(updateAt),
            journalister: {
                connect: {
                    id: j.id
                }
            }
        }
    }).catch((error) => {
        console.error(error);
        return 500;
    });

    if(artikkel === 500) {
        return res.status(500).json({ error: 'An error occurred while fetching the article' });
    }

    if(!artikkel) {
        return res.status(404).json({ error: 'Article not found' });
    }

    res.json(artikkel);
});

app.post("/updateArticle", async (req, res) => {
    const { id, title, content, views, updateAt, journalist } = req.body;

    const j = await prisma.journalist.findFirst({
        where: {
            fornavn: {
                startsWith: journalist
            }
        }
    });

    if (!j) {
        return
    }

    const artikkel = await prisma.artikkel.update({
        where: {
            id: parseInt(id)
        },
        data: {
            title: title,
            content: content,
            views: parseInt(views),
            updateAt: new Date(updateAt),
            journalister: {
                connect: {
                    id: j.id
                }
            }
        }
    }).catch((error) => {
        console.error(error);
        return 500;
    });

    if(artikkel === 500) {
        return res.status(500).json({ error: 'An error occurred while fetching the article' });
    }

    if(!artikkel) {
        return res.status(404).json({ error: 'Article not found' });
    }

    res.json(artikkel);
});

app.get('/api/artikkel/:id', async (req, res) => {
    const { id } = req.params;
    const apiArtikkel = await prisma.artikkel.findUnique({
        where: {
            id: parseInt(id)
        }
    }).catch(() => 500)

    if(apiArtikkel === 500) {
        return res.status(500).json({ error: 'An error occurred while fetching the article' });
    }

    if(!apiArtikkel) {
        return res.status(404).json({ error: 'Article not found' });
    }

    res.json(apiArtikkel);
});

app.get('/api/journalists/popular', async (req, res) => {
    const popularPeople = await prisma.artikkel.findMany({
        orderBy: { // sorterer artiklene etter views
            views: 'desc' // descending
        },

        where: { // filtrerer hvilke artikler den henter
            AND: [
                {
                    journalister: {
                        some: {
                            fornavn: {
                                startsWith: "Jo"
                            }
                        }
                    }
                },

                {
                    journalister: {
                        some: {
                            fornavn: {
                                startsWith: "Trond"
                            }
                        }
                    
                    }
                }
            ]
        }
    }).catch(() => 500);

    if(popularPeople === 500) {
        return res.status(500).json({ error: 'An error occurred while fetching the popular journalists' }); // hvis det ikke funker så console.logger den error
    }

    res.json(popularPeople); // sender data json
});


app.listen(3000, () => {
    console.log(`Server running on port 3000`);
});