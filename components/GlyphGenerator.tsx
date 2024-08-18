import React, {useState, useEffect, useCallback} from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { X } from 'lucide-react';
import { auth, database, storage } from '../firebaseConfig';
import { ref, set, get, update, push } from 'firebase/database';
import {onAuthStateChanged, signInAnonymously, User} from "firebase/auth";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import Image from 'next/image';

const glyphs = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];

interface GalleryItem {
    id: string;
    votes: {
        count: number;
        users: Record<string, string>;
    };
    description: string;
    tags: string[];
    creatorId: string;
    images: string[];
    address: string;
}


const GlyphGenerator = () => {
    const [portalAddress, setPortalAddress] = useState(Array(12).fill('0'));
    const [manualInput, setManualInput] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [friendshipCode, setFriendshipCode] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
    const [images, setImages] = useState<{ url: string; file: File | null; }[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [gallery, setGallery] = useState<GalleryItem[]>([]);


    const loadUserData = useCallback(async(userId: string) => {
        const userRef = ref(database, `users/${userId}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            const userData = snapshot.val();
            setPortalAddress(userData.portalAddress || Array(12).fill('0'));
            setFriendshipCode(userData.friendshipCode || '');
        }
        loadGallery();
    }, []);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(() => user);
                await loadUserData(user.uid);
            } else {
                try {
                    const newUser = await signInAnonymously(auth);
                    setUser(() => newUser.user);
                    await loadUserData(newUser.user.uid);
                } catch (error) {
                    console.error("Error signing in anonymously:", error);
                }
            }
            await loadGallery();
        });

        return () => unsubscribe();
    }, [loadUserData]);

    const uploadImage = async (file: File | null) => {
        if (file instanceof File) {
            console.log("Starting image upload for file:", file.name);
            const imageRef = storageRef(storage, `images/${Date.now()}_${file.name}`);


            try {
                console.log("Uploading file...");
                const snapshot = await uploadBytes(imageRef, file);
                console.log("File uploaded successfully. Getting download URL...");
                const downloadURL = await getDownloadURL(snapshot.ref);
                console.log("Download URL obtained:", downloadURL);
                return downloadURL;
            } catch (error) {
                console.error("Error uploading image: ", error);
                showAlertMessage(`Failed to upload image: ${(error as Error).message}`);
                throw error;
            }
        } else {
            console.error("Invalid file type:", file);
            showAlertMessage('Invalid file type. Please try again.');
        }
    };

    const loadGallery = async () => {
        const galleryRef = ref(database, 'gallery');
        const snapshot = await get(galleryRef);
        if (snapshot.exists()) {
            const galleryData = snapshot.val();
            setGallery(Object.entries(galleryData).map(([key, value]) => {
                if (typeof value === 'object' && value !== null) {
                    const item = value as { votes?: { count: number, users: object } };
                    return {
                        id: key,
                        ...item,
                        votes: item.votes || { count: 0, users: {} }
                    };
                } else {
                    return {
                        id: key,
                        votes: { count: 0, users: {} }
                    };
                }
            }) as GalleryItem[]);
        }
    };

    const saveToFirebase = async (data: Record<string, any>) => {
        if (user) {
            try {
                await update(ref(database, `users/${user.uid}`), data);
            } catch (error) {
                console.error(error);
            }
        }
    };


    const generateRandomAddress = () => {
        const newAddress = Array(12).fill(0).map(() => glyphs[Math.floor(Math.random() * glyphs.length)]);
        setPortalAddress(newAddress);
        setManualInput(newAddress.join(''));
        saveToFirebase({ portalAddress: newAddress });
    };

    const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value.toUpperCase();
        setManualInput(input);
        if (input.length === 12 && input.split('').every(char => glyphs.includes(char))) {
            setPortalAddress(input.split(''));
            saveToFirebase({ portalAddress: input.split('') });
        }
    };

    const saveAddress = (address: string[]) => {
        localStorage.setItem('nmsPortalAddress', JSON.stringify(address));
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(portalAddress.join(''));
        showAlertMessage('Address copied to clipboard.');
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newImages = files.map((file: File) => ({
            url: URL.createObjectURL(file),
            file: file
        }));
        setImages([...images, ...newImages]);
    };



    const removeImage = (index:number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };

    const addToGallery = async () => {
        try {
            console.log("Starting to add to gallery...");
            console.log("Uploading images...");
            const imageUrls = await Promise.all(images.map(img => uploadImage(img.file)));
            console.log("Image URLs obtained:", imageUrls);

            if (!friendshipCode) {
                showAlertMessage('Please enter your NMS friendship code to share to the gallery.');
                return;
            }

            const newGalleryItem = {
                address: portalAddress.join(''),
                votes: {
                    count: 0,
                    users: {}
                },
                description: description,
                tags: tags.split(',').map(tag => tag.trim()),
                creatorId: friendshipCode,
                images: imageUrls
            };

            console.log("New gallery item:", newGalleryItem);

            const newItemRef = push(ref(database, 'gallery'));
            await set(newItemRef, newGalleryItem);

            setDescription('');
            setTags('');
            setImages([]);
            showAlertMessage('Address added to gallery successfully.');
            await loadGallery();
        } catch (error) {
            console.error("Error adding to gallery:", error);
            if (error instanceof Error) {
                showAlertMessage(`Failed to add to gallery: ${error.message}`);
            }
        }
    };

    const handleVote = async (id: string, voteType: string) => {
        if (!friendshipCode) {
            showAlertMessage('Please enter your NMS friendship code to vote.');
            return;
        }
        const itemToVote = gallery.find(item => item.id === id);
        if (!(itemToVote) || itemToVote.creatorId === friendshipCode) {
            showAlertMessage('You cannot vote for your own posts.');
            return;
        }
        try {
            const itemRef = ref(database, `gallery/${id}`);
            const snapshot = await get(itemRef);
            const currentVotes = snapshot.val().votes || { count: 0, users: {} };
            const userCurrentVote = currentVotes.users[friendshipCode];

            let newVoteCount = currentVotes.count;
            if (userCurrentVote === voteType) {
                // User is un-voting
                newVoteCount -= voteType === 'up' ? 1 : -1;
                delete currentVotes.users[friendshipCode];
            } else {
                // User is changing vote or voting for the first time
                if (userCurrentVote) {
                    newVoteCount -= userCurrentVote === 'up' ? 1 : -1;
                }
                newVoteCount += voteType === 'up' ? 1 : -1;
                currentVotes.users[friendshipCode] = voteType;
            }

            await update(itemRef, {
                votes: {
                    count: newVoteCount,
                    users: currentVotes.users
                }
            });
            await loadGallery(); // Reload the gallery to reflect the updated vote
        } catch (error) {
            console.error("Error voting:", error);
            showAlertMessage('Failed to vote. Please try again.');
        }
    };

    const startEditing = (item: GalleryItem) => {
        if (item.creatorId !== friendshipCode) {
            showAlertMessage('You can only edit your own posts.');
            return;
        }
        setEditingItem(item);
        setDescription(item.description);
        setTags(item.tags.join(', '));
        setImages(item.images.map(url => ({ url, file: null })));
    };
    const saveEdit = async () => {
        try {
            const updatedItem = {
                ...editingItem,
                description: description,
                tags: tags.split(',').map(tag => tag.trim()),
                images: images.map(img => img.url)
            };
            await update(ref(database, `gallery/${editingItem?.id}`), updatedItem);
            setEditingItem(null);
            setDescription('');
            setTags('');
            setImages([]);
            showAlertMessage('Address details updated successfully.');
            loadGallery(); // Reload the gallery to reflect the changes
        } catch (error) {
            console.error("Error updating gallery item:", error);
            showAlertMessage('Failed to update. Please try again.');
        }
    };

    const handleFriendshipCodeInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value;
    setFriendshipCode(code);
    if (user) {
        try {
            await set(ref(database, `users/${user.uid}/friendshipCode`), code);
        } catch (error) {
            console.error("Error saving friendship code:", error);
        }
    }
};

    const showAlertMessage = (message: string) => {
        setAlertMessage(message);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
    };

    const ImageGallery = ({ images, onRemove, editable }) => (
        <div className="grid grid-cols-3 gap-2 mb-2">
            {images.map((image, index) => (
                <div key={index} className="relative">
                    <img src={image.url} alt={`Uploaded image ${index + 1}`} className="w-full h-auto rounded" />
                    {editable && (
                        <Button
                            className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full"
                            onClick={() => onRemove(index)}
                        >
                            <X size={16} />
                        </Button>
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="p-4 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">No Man's Sky Portal Address Tool</h1>

            <div className="mb-4">
                <Input
                    type="text"
                    value={friendshipCode}
                    onChange={handleFriendshipCodeInput}
                    placeholder="Enter your NMS friendship code"
                    className="mb-2"
                />
            </div>

            <Tabs defaultValue="generator">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="generator">Generator</TabsTrigger>
                    <TabsTrigger value="translator">Translator</TabsTrigger>
                    <TabsTrigger value="gallery">Gallery</TabsTrigger>
                </TabsList>

                <TabsContent value="generator">
                    <Button onClick={generateRandomAddress} className="w-full mb-4">
                        Generate Random Address
                    </Button>
                    <div className="grid grid-cols-6 gap-2 mb-4">
                        {portalAddress.map((glyph, index) => (
                            <div key={index} className="w-12 h-12 flex items-center justify-center bg-gray-800 rounded">
                                <Image
                                    src={`/glyphs/glyph${parseInt(glyph, 16) + 1}.webp`}
                                    alt={`Glyph ${glyph}`}
                                    width={40}
                                    height={40}
                                />
                            </div>
                        ))}
                    </div>
                    <Input
                        type="text"
                        value={manualInput}
                        onChange={handleManualInput}
                        placeholder="Enter 12 character address (0-9, A-F)"
                        className="mb-2"
                    />
                    <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add a description (optional)"
                        className="mb-2"
                    />
                    <Input
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="Add tags, separated by commas (optional)"
                        className="mb-2"
                    />
                    <Input
                        type="file"
                        multiple
                        onChange={handleImageUpload}
                        className="mb-2"
                    />
                    <ImageGallery images={images} onRemove={removeImage} editable={true} />
                    <Button onClick={addToGallery} className="w-full mb-2">
                        Add to Gallery
                    </Button>
                    <Button onClick={copyToClipboard} className="w-full">
                        Copy Address
                    </Button>
                </TabsContent>

                <TabsContent value="translator">
                    <Input
                        type="text"
                        value={manualInput}
                        onChange={handleManualInput}
                        placeholder="Enter 12 character address (0-9, A-F)"
                        className="mb-4"
                    />
                    <div className="grid grid-cols-6 gap-2 mb-4">
                        {portalAddress.map((glyph, index) => (
                            <div key={index} className="w-12 h-12 flex items-center justify-center bg-gray-800 rounded">
                                <Image
                                    src={`/glyphs/glyph${parseInt(glyph, 16) + 1}.webp`}
                                    alt={`Glyph ${glyph}`}
                                    width={40}
                                    height={40}
                                />
                            </div>
                        ))}
                    </div>
                    <Button onClick={copyToClipboard} className="w-full">
                        Copy Address
                    </Button>
                </TabsContent>

                <TabsContent value="gallery">
                    <div className="space-y-4">
                        {gallery.map(item => (
                            <div key={item.id} className="bg-gray-100 p-3 rounded">
                                {item.images && item.images.length > 0 && (
                                    <img src={item.images[0]} alt="Gallery item" className="w-full h-auto mb-2 rounded" />
                                )}
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex">
                                        {(item.address?.split('') || []).map((glyph, index) => (
                                            <img key={index} src={`/glyphs/glyph${parseInt(glyph, 16) + 1}.webp`} alt={`Glyph ${glyph}`} className="w-8 h-8 mr-1 bg-gray-800 rounded-sm" />
                                        ))}
                                    </div>
                                    <div>
                                        <span className="mr-2">{item.votes?.count || 0}</span>
                                        <Button
                                            onClick={() => handleVote(item.id, 'up')}
                                            className={`mr-1 ${item.votes?.users?.[friendshipCode] === 'up' ? 'bg-blue-500' : ''}`}
                                            disabled={!friendshipCode || item.creatorId === friendshipCode}
                                        >
                                            👍
                                        </Button>
                                        <Button
                                            onClick={() => handleVote(item.id, 'down')}
                                            className={`mr-1 ${item.votes?.users?.[friendshipCode] === 'down' ? 'bg-red-500' : ''}`}
                                            disabled={!friendshipCode || item.creatorId === friendshipCode}
                                        >
                                            👎
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-sm mb-1">{item.description}</p>
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {item.tags.map((tag, index) => (
                                        <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {tag}
                        </span>
                                    ))}
                                </div>
                                {item.creatorId === friendshipCode && (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                        <Button onClick={() => startEditing(item)}>Edit</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Edit Address Details</DialogTitle>
                                            </DialogHeader>
                                            <Textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="Edit description"
                                                className="mb-2"
                                            />
                                            <Input
                                                value={tags}
                                                onChange={(e) => setTags(e.target.value)}
                                                placeholder="Edit tags, separated by commas"
                                                className="mb-2"
                                            />
                                            <Input
                                                type="file"
                                                multiple
                                                onChange={handleImageUpload}
                                                className="mb-2"
                                            />
                                            <ImageGallery images={images} onRemove={removeImage} editable={true} />
                                            <Button onClick={saveEdit}>Save Changes</Button>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {showAlert && (
                <Alert className="mt-4">
                    <AlertTitle>Notification</AlertTitle>
                    <AlertDescription>{alertMessage}</AlertDescription>
                </Alert>
            )}

            <div className="mt-8 p-4 bg-gray-100 rounded">
                <h2 className="text-lg font-semibold mb-2">How Portal Addresses Work</h2>
                <p className="text-sm">
                    In No Man&apos;s Sky, portal addresses consist of 12 glyphs chosen from a set of 16 possible glyphs.
                    The first glyph represents the planetary index, the next two the solar system index, followed by one
                    for the planet index, and the remaining eight for specific X, Y, and Z coordinates within that
                    system. By inputting a specific sequence of glyphs, players can teleport to corresponding locations
                    across the vast game world.
                </p>
            </div>
        </div>
    );
};

export default GlyphGenerator;