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
import BiDirectionalTranslator from "@/components/BiDirectionalTranslator";
import TooltipInput from './TooltipInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
    galaxy: string;
    createdAt: string;
}

interface ImageGalleryProps {
    images: { url: string; file: File | null; }[];
    onRemove: (index: number) => void;
    editable: boolean;
}

const galaxies = [
    "Not Specified",
    "Euclid  (1)", "Hilbert Dimension  (2)", "Calypso  (3)", "Hesperius Dimension  (4)", "Hyades  (5)",
    "Ickjamatew  (6)", "Budullangr  (7)", "Kikolgallr  (8)", "Eltiensleen  (9)", "Eissentam  (10)",
    "Elkupalos  (11)", "Aptarkaba  (12)", "Ontiniangp  (13)", "Odiwagiri  (14)", "Ogtialabi  (15)",
    "Muhacksonto  (16)", "Hitonskyer  (17)", "Rerasmutul  (18)", "Isdoraijung  (19)", "Doctinawyra  (20)",
    "Loychazinq  (21)", "Zukasizawa  (22)", "Ekwathore  (23)", "Yeberhahne  (24)", "Twerbetek  (25)",
    "Sivarates  (26)", "Eajerandal  (27)", "Aldukesci  (28)", "Wotyarogii  (29)", "Sudzerbal  (30)",
    "Maupenzhay  (31)", "Sugueziume  (32)", "Brogoweldian  (33)", "Ehbogdenbu  (34)", "Ijsenufryos  (35)",
    "Nipikulha  (36)", "Autsurabin  (37)", "Lusontrygiamh  (38)", "Rewmanawa  (39)", "Ethiophodhe  (40)",
    "Urastrykle  (41)", "Xobeurindj  (42)", "Oniijialdu  (43)", "Wucetosucc  (44)", "Ebyeloofdud  (45)",
    "Odyavanta  (46)", "Milekistri  (47)", "Waferganh  (48)", "Agnusopwit  (49)", "Teyaypilny  (50)",
    "Zalienkosm  (51)", "Ladgudiraf  (52)", "Mushonponte  (53)", "Amsentisz  (54)", "Fladiselm  (55)",
    "Laanawemb  (56)", "Ilkerloor  (57)", "Davanossi  (58)", "Ploehrliou  (59)", "Corpinyaya  (60)",
    "Leckandmeram  (61)", "Quulngais  (62)", "Nokokipsechl  (63)", "Rinblodesa  (64)", "Loydporpen  (65)",
    "Ibtrevskip  (66)", "Elkowaldb  (67)", "Heholhofsko  (68)", "Yebrilowisod  (69)", "Husalvangewi  (70)",
    "Ovna'uesed  (71)", "Bahibusey  (72)", "Nuybeliaure  (73)", "Doshawchuc  (74)", "Ruckinarkh  (75)",
    "Thorettac  (76)", "Nuponoparau  (77)", "Moglaschil  (78)", "Uiweupose  (79)", "Nasmilete  (80)",
    "Ekdaluskin  (81)", "Hakapanasy  (82)", "Dimonimba  (83)", "Cajaccari  (84)", "Olonerovo  (85)",
    "Umlanswick  (86)", "Henayliszm  (87)", "Utzenmate  (88)", "Umirpaiya  (89)", "Paholiang  (90)",
    "Iaereznika  (91)", "Yudukagath  (92)", "Boealalosnj  (93)", "Yaevarcko  (94)", "Coellosipp  (95)",
    "Wayndohalou  (96)", "Smoduraykl  (97)", "Apmaneessu  (98)", "Hicanpaav  (99)", "Akvasanta  (100)",
    "Tuychelisaor (101)", "Rivskimbe (102)", "Daksanquix (103)",
    "Kissonlin (104)", "Aediabiel (105)", "Ulosaginyik (106)",
    "Roclaytonycar (107)", "Kichiaroa (108)", "Irceauffey (109)",
    "Nudquathsenfe (110)", "Getaizakaal (111)", "Hansolmien (112)",
    "Bloytisagra (113)", "Ladsenlay (114)", "Luyugoslasr (115)",
    "Ubredhatk (116)", "Cidoniana (117)", "Jasinessa (118)",
    "Torweierf (119)", "Saffneckm (120)", "Thnistner (121)",
    "Dotusingg (122)", "Luleukous (123)", "Jelmandan (124)",
    "Otimanaso (125)", "Enjaxusanto (126)", "Sezviktorew (127)",
    "Zikehpm (128)", "Bephembah (129)", "Broomerrai (130)",
    "Meximicka (131)", "Venessika (132)", "Gaiteseling (133)",
    "Zosakasiro (134)", "Drajayanes (135)", "Ooibekuar (136)",
    "Urckiansi (137)", "Dozivadido (138)", "Emiekereks (139)",
    "Meykinunukur (140)", "Kimycuristh (141)", "Roansfien (142)",
    "Isgarmeso (143)", "Daitibeli (144)", "Gucuttarik (145)",
    "Enlaythie (146)", "Drewweste (147)", "Akbulkabi (148)",
    "Homskiw (149)", "Zavainlani (150)", "Jewijkmas (151)",
    "Itlhotagra (152)", "Podalicess (153)", "Hiviusauer (154)",
    "Halsebenk (155)", "Puikitoac (156)", "Gaybakuaria (157)",
    "Grbodubhe (158)", "Rycempler (159)", "Indjalala (160)",
    "Fontenikk (161)", "Pasycihelwhee (162)", "Ikbaksmit (163)",
    "Telicianses (164)", "Oyleyzhan (165)", "Uagerosat (166)",
    "Impoxectin (167)", "Twoodmand (168)", "Hilfsesorbs (169)",
    "Ezdaranit (170)", "Wiensanshe (171)", "Ewheelonc (172)",
    "Litzmantufa (173)", "Emarmatosi (174)", "Mufimbomacvi (175)",
    "Wongquarum (176)", "Hapirajua (177)", "Igbinduina (178)",
    "Wepaitvas (179)", "Sthatigudi (180)", "Yekathsebehn (181)",
    "Ebedeagurst (182)", "Nolisonia (183)", "Ulexovitab (184)",
    "Iodhinxois (185)", "Irroswitzs (186)", "Bifredait (187)",
    "Beiraghedwe (188)", "Yeonatlak (189)", "Cugnatachh (190)",
    "Nozoryenki (191)", "Ebralduri (192)", "Evcickcandj (193)",
    "Ziybosswin (194)", "Heperclait (195)", "Sugiuniam (196)",
    "Aaseertush (197)", "Uglyestemaa (198)", "Horeroedsh (199)",
    "Drundemiso (200)", "Ityanianat  (201)",
    "Purneyrine  (202)",
    "Dokiessmat  (203)",
    "Nupiacheh  (204)",
    "Dihewsonj  (205)",
    "Rudrailhik  (206)",
    "Tweretnort  (207)",
    "Snatreetze  (208)",
    "Iwunddaracos  (209)",
    "Digarlewena  (210)",
    "Erquagsta  (211)",
    "Logovoloin  (212)",
    "Boyaghosganh  (213)",
    "Kuolungau  (214)",
    "Pehneldept  (215)",
    "Yevettiiqidcon  (216)",
    "Sahliacabru  (217)",
    "Noggalterpor  (218)",
    "Chmageaki  (219)",
    "Veticueca  (220)",
    "Vittesbursul  (221)",
    "Nootanore  (222)",
    "Innebdjerah  (223)",
    "Kisvarcini  (224)",
    "Cuzcogipper  (225)",
    "Pamanhermonsu  (226)",
    "Brotoghek  (227)",
    "Mibittara  (228)",
    "Huruahili  (229)",
    "Raldwicarn  (230)",
    "Ezdartlic  (231)",
    "Badesclema  (232)",
    "Isenkeyan  (233)",
    "Iadoitesu  (234)",
    "Yagrovoisi  (235)",
    "Ewcomechio  (236)",
    "Inunnunnoda  (237)",
    "Dischiutun  (238)",
    "Yuwarugha  (239)",
    "Ialmendra  (240)",
    "Reponudrle  (241)",
    "Rinjanagrbo  (242)",
    "Zeziceloh  (243)",
    "Oeileutasc  (244)",
    "Zicniijinis  (245)",
    "Dugnowarilda  (246)",
    "Neuxoisan  (247)",
    "Ilmenhorn  (248)",
    "Rukwatsuku  (249)",
    "Nepitzaspru  (250)",
    "Chcehoemig  (251)",
    "Haffneyrin  (252)",
    "Uliciawai  (253)",
    "Tuhgrespod  (254)",
    "Iousongola  (255)",
    "Odyalutai  (256)",
    "Yilsrussimil  (257)",
    "Loqvishess  (258)",
    "Enyokudohkiw  (259)",
    "Helqvishap  (260)",
    "Usgraikik  (261)",
    "Hiteshamij  (262)",
    "Uewamoisow  (263)",
    "Pequibanu  (264)"
];



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
    const [selectedGalaxy, setSelectedGalaxy] = useState(galaxies[0]);
    const [editingGalaxy, setEditingGalaxy] = useState(galaxies[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGalaxy, setFilterGalaxy] = useState('All');
    const [sortBy, setSortBy] = useState('votes');
    const [filteredGallery, setFilteredGallery] = useState<GalleryItem[]>([]);

    useEffect(() => {
        const filtered = gallery.filter(item =>
            (item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) &&
            (filterGalaxy === 'All' || item.galaxy === filterGalaxy)
        );

        const sorted = [...filtered].sort((a, b) => {
            if (sortBy === 'votes') return (b.votes?.count || 0) - (a.votes?.count || 0);
            if (sortBy === 'recent') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            return 0;
        });

        setFilteredGallery(sorted);
    }, [gallery, searchTerm, filterGalaxy, sortBy]);

    const getGlyphImagePath = (glyph: string) => {
        const basePath = process.env.NODE_ENV === 'production' ? '/nmsportal' : '';
        return `${basePath}/glyphs/glyph${parseInt(glyph, 16) + 1}.webp`;
    };

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
            const galleryItems = Object.entries(galleryData).map(([key, value]) => {
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
            }) as GalleryItem[];

            galleryItems.sort((a, b) => (b.votes?.count || 0) - (a.votes?.count || 0));

            setGallery(galleryItems);
        } else {
            setGallery([]);
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
                images: imageUrls,
                galaxy: selectedGalaxy === "Not Specified" ? null : selectedGalaxy,
                createdAt: new Date().toISOString()
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
        if (!itemToVote || itemToVote.creatorId === friendshipCode) {
            showAlertMessage('You cannot vote for your own posts.');
            return;
        }
        try {
            const itemRef = ref(database, `gallery/${id}`);
            const snapshot = await get(itemRef);
            if (!snapshot.exists()) {
                showAlertMessage('This item no longer exists.');
                return;
            }
            const itemData = snapshot.val();
            const currentVotes = itemData.votes || { count: 0, users: {} };
            const userCurrentVote = currentVotes.users?.[friendshipCode];

            let newVoteCount = currentVotes.count || 0;
            let newUserVotes = { ...currentVotes.users };

            if (userCurrentVote === voteType) {
                newVoteCount -= voteType === 'up' ? 1 : -1;
                delete newUserVotes[friendshipCode];
            } else {
                if (userCurrentVote) {
                    newVoteCount -= userCurrentVote === 'up' ? 1 : -1;
                }
                newVoteCount += voteType === 'up' ? 1 : -1;
                newUserVotes[friendshipCode] = voteType;
            }

            await update(itemRef, {
                votes: {
                    count: newVoteCount,
                    users: newUserVotes
                }
            });
            await loadGallery();
            showAlertMessage('Vote recorded successfully.');
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
        setDescription(item.description || '');
        setTags(item.tags?.join(', ') || '');
        setImages(item.images?.map(url => ({ url, file: null })) || []);
        setEditingGalaxy(item.galaxy || galaxies[0]);
    };

    const saveEdit = async () => {
        try {
            const updatedItem = {
                ...editingItem,
                description: description,
                tags: tags.split(',').map(tag => tag.trim()),
                images: images.map(img => img.url),
                galaxy: editingGalaxy === "Not Specified" ? null : editingGalaxy
            };
            await update(ref(database, `gallery/${editingItem?.id}`), updatedItem);
            setEditingItem(null);
            setDescription('');
            setTags('');
            setImages([]);
            setEditingGalaxy(galaxies[0]);
            showAlertMessage('Address details updated successfully.');
            loadGallery(); // Reload the gallery to reflect the changes
        } catch (error) {
            console.error("Error updating gallery item:", error);
            showAlertMessage('Failed to update. Please try again.');
        }
    };

    const handleFriendshipCodeInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        let code = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');

        code = code.replace(/-/g, '');

        if (code.length > 4) {
            code = code.slice(0, 4) + '-' + code.slice(4);
        }
        if (code.length > 9) {
            code = code.slice(0, 9) + '-' + code.slice(9);
        }

        code = code.slice(0, 15);

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

    const renderGalaxyInfo = (galaxy: string | null) => {
        if (!galaxy || galaxy === "Not Specified") {
            return <p className="text-sm mb-1 text-gray-500">Galaxy: Not Specified</p>;
        }
        return <p className="text-sm mb-1">Galaxy: {galaxy}</p>;
    };

    const ImageGallery: React.FC<ImageGalleryProps> = ({ images, onRemove, editable }) => (
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

    const ImageCarousel = ({ images }: { images: string[] }) => {
        const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
        const [currentIndex, setCurrentIndex] = useState(0);

        useEffect(() => {
            if (emblaApi) {
                emblaApi.on('select', () => {
                    setCurrentIndex(emblaApi.selectedScrollSnap());
                });
            }
        }, [emblaApi]);

        const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
        const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

        return (
            <div className="relative">
                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex">
                        {images.map((image, index) => (
                            <div key={index} className="flex-[0_0_100%] min-w-0">
                                <img src={image} alt={`Gallery item ${index + 1}`} className="w-full h-auto object-cover aspect-video" />
                            </div>
                        ))}
                    </div>
                </div>
                {images.length > 1 && (
                    <>
                        <button
                            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                            onClick={scrollPrev}
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                            onClick={scrollNext}
                        >
                            <ChevronRight size={24} />
                        </button>
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                            {images.map((_, index) => (
                                <div
                                    key={index}
                                    className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-gray-400'}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="p-4 max-w-3xl mx-auto mt-4">

            <div className="mb-4">
                <TooltipInput
                    type="text"
                    value={friendshipCode}
                    onChange={handleFriendshipCodeInput}
                    placeholder="Enter your NMS friendship code"
                    className="mb-2 w-full"
                    tooltipText="Your unique No Man's Sky friend code used to identify your contributions."
                />
            </div>

            <Tabs defaultValue="generator" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="generator">Generator</TabsTrigger>
                    <TabsTrigger value="translator">Translator</TabsTrigger>
                    <TabsTrigger value="gallery">Gallery</TabsTrigger>
                </TabsList>

                <TabsContent value="generator">
                    <Button onClick={generateRandomAddress} className="w-full mb-4">
                        Generate Random Address
                    </Button>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-4">
                        {portalAddress.map((glyph, index) => (
                            <div key={index}
                                 className="w-full aspect-square flex items-center justify-center bg-gray-800 rounded">
                                <Image
                                    src={getGlyphImagePath(glyph)}
                                    alt={`Glyph ${glyph}`}
                                    width={40}
                                    height={40}
                                    layout="responsive"
                                />
                            </div>
                        ))}
                    </div>
                    <p>Galaxy:</p>
                    <Select value={selectedGalaxy} onValueChange={setSelectedGalaxy}>
                        <SelectTrigger className="w-full mb-2">
                            <SelectValue placeholder="Select galaxy (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                            {galaxies.map((galaxy) => (
                                <SelectItem key={galaxy} value={galaxy}>
                                    {galaxy}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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
                    <TooltipInput
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="Add tags, separated by commas (optional)"
                        className="mb-2"
                        tooltipText="Add descriptive tags to help others find your shared location."
                    />
                    <Input
                        type="file"
                        multiple
                        onChange={handleImageUpload}
                        className="mb-2"
                    />
                    <ImageGallery images={images} onRemove={removeImage} editable={true}/>
                    <Button onClick={addToGallery} className="w-full mb-2">
                        Add to Gallery
                    </Button>
                    <Button onClick={copyToClipboard} className="w-full">
                        Copy Address
                    </Button>
                </TabsContent>

                <TabsContent value="translator">
                    <BiDirectionalTranslator />
                </TabsContent>

                <TabsContent value="gallery">
                    <div className="space-y-4 mb-4">
                        <Input
                            type="text"
                            placeholder="Search by description or tags"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="mb-2"
                        />
                        <div className="flex space-x-2">
                            <div className="flex-1">
                                <Label htmlFor="galaxy-filter">Filter by Galaxy</Label>
                                <Select value={filterGalaxy} onValueChange={setFilterGalaxy}>
                                    <SelectTrigger id="galaxy-filter">
                                        <SelectValue placeholder="Select galaxy" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Galaxies</SelectItem>
                                        {galaxies.map((galaxy) => (
                                            <SelectItem key={galaxy} value={galaxy}>
                                                {galaxy}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex-1">
                                <Label htmlFor="sort-by">Sort by</Label>
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger id="sort-by">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="votes">Most Upvoted</SelectItem>
                                        <SelectItem value="recent">Most Recent</SelectItem>
                                        <SelectItem value="oldest">Oldest</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {filteredGallery.map(item => (
                            <div key={item.id} className="bg-gray-100 p-3 rounded">
                                {item.images && item.images.length > 0 && (
                                    <ImageCarousel images={item.images} />
                                )}
                                <div className="flex flex-wrap items-center justify-between mb-2">
                                    <div className="flex flex-wrap">
                                        {(item.address?.split('') || []).map((glyph, index) => (
                                            <img
                                                key={index}
                                                src={getGlyphImagePath(glyph)}
                                                alt={`Glyph ${glyph}`}
                                                className="w-6 h-6 mr-1 mb-1 bg-gray-800 rounded-sm"
                                            />
                                        ))}
                                    </div>
                                    <div className="flex items-center mt-2 sm:mt-0">
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
                                {renderGalaxyInfo(item.galaxy)}
                                <p className="text-sm mb-1">{item.description}</p>
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {item.tags.map((tag, index) => (
                                        <span key={index}
                                              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
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
                                            <Select value={editingGalaxy} onValueChange={setEditingGalaxy}>
                                                <SelectTrigger className="w-full mb-2">
                                                    <SelectValue placeholder="Select galaxy (optional)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {galaxies.map((galaxy) => (
                                                        <SelectItem key={galaxy} value={galaxy}>
                                                            {galaxy}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                type="file"
                                                multiple
                                                onChange={handleImageUpload}
                                                className="mb-2"
                                            />
                                            <ImageGallery images={images} onRemove={removeImage} editable={true}/>
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

        </div>
    );
};

export default GlyphGenerator;