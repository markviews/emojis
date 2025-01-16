import React, { useEffect, useState } from "react";
import { db, auth } from './firebase';
import { ShowNotification } from "./notification";
import { getDoc, doc, updateDoc } from "firebase/firestore";

let ClearAddEmojiTextbox: () => void = () => { };

function EmojiGrid({
    setActiveTab,
}: {
    setActiveTab: (tab: string) => void;
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [emojis, setEmojis] = useState<{ emoji: string, name: string }[]>([]);
    const [publicEmojis, setPublicEmojis] = useState<{ emoji: string, name: string }[]>([]);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [editingIndex, setEditingIndex] = useState(-1);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

    // localstorage settings
    const [showEditButton, setShowEditButton] = useState(true);
    const [showPublicEmojis, setShowPublicEmojis] = useState(true);
    const [showSearch, setShowSearch] = useState(true);

    useEffect(() => {
        const storedShowEditButton = localStorage.getItem('showEditButton');
        const storedShowPublicEmojis = localStorage.getItem('showPublicEmojis');
        const storedShowSearch = localStorage.getItem('showSearch');

        setShowEditButton(storedShowEditButton !== null ? JSON.parse(storedShowEditButton) : true);
        setShowPublicEmojis(storedShowPublicEmojis !== null ? JSON.parse(storedShowPublicEmojis) : true);
        setShowSearch(storedShowSearch !== null ? JSON.parse(storedShowSearch) : true);
    }, []);

    const filteredEmojis = emojis.filter((emoji) =>
        emoji.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredEmojisPublic = publicEmojis.filter((emoji) =>
        emoji.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const reorderFirestore = async (emojis: { emoji: string, name: string }[]) => {
        try {
            const user = auth.currentUser;
            if (!user) {
                console.error('No user found!');
                return;
            }

            const userDoc = await getDoc(doc(db, "userdata", user.uid));
            if (!userDoc.exists()) {
                console.error('No user data found!');
                return;
            }

            updateDoc(doc(db, "userdata", user.uid), { emojis: emojis }).then(() => {
                ShowNotification("Saved");
            });

            setEmojis(emojis); // Update state with emojis from Firestore
        } catch (error) {
            console.error('Error fetching emojis:', error);
            // TODO: show error message
        }
    };

    // Fetch emojis from the server
    useEffect(() => {
        fetchEmojisFirestore();

        if (showPublicEmojis)
            fetchPublicEmojis();
    });

    // Fetch emojis directly from Firestore to avoid cold start delay
    const fetchEmojisFirestore = async () => {

        // wait a bit for things to load
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            const user = auth.currentUser;
            if (!user) return;

            const userDoc = await getDoc(doc(db, "userdata", user.uid));
            if (!userDoc.exists()) {
                setEmojis([]); // Set empty array if no data found
                return;
            }

            const data = userDoc.data() as { emojis?: { emoji: string, name: string }[] };
            if (!data.emojis) {
                setEmojis([]); // Set empty array if no data found
                return;
            }

            setEmojis(data.emojis); // Update state with emojis from Firestore
        } catch (error) {
            console.error('Error fetching emojis:', error);
            // TODO: show error message
        }
    };

    const fetchPublicEmojis = async () => {

        // wait a bit for things to load
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            const userDoc = await getDoc(doc(db, "userdata", "VVTSS5xcLXgAQbYwB0ijW4Se7pA3"));
            if (!userDoc.exists()) {
                setEmojis([]); // Set empty array if no data found
                return;
            }

            const data = userDoc.data() as { emojis?: { emoji: string, name: string }[] };
            if (!data.emojis) {
                setEmojis([]); // Set empty array if no data found
                return;
            }

            setPublicEmojis(data.emojis); // Update state with emojis from Firestore
        } catch (error) {
            console.error('Error fetching emojis:', error);
            // TODO: show error message
        }
    };

    const handleEmojiClick = async (emoji: { emoji: string, name: string }) => {

        if (showAddMenu) {
            // edit emoji
            const index = emojis.indexOf(emoji);

            // disabled due to users likeley getting confused
            // // if click same emoji, close edit menu
            // if (index == editingIndex) {
            //     setEditingIndex(-1);
            //     return;
            // }

            setEditingIndex(index);
            return;
        }

        let emojiText = emoji.emoji;

        if (emojiText.length > 2) {
            emojiText = `https://cdn.discordapp.com/emojis/${emoji.emoji}?size=48`;
        }

        navigator.clipboard.writeText(emojiText);
        ShowNotification("Copied to clipboard!");
    };

    const handleDragStart = (index: number) => {
        setDraggingIndex(index);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        if (draggingIndex !== null && draggingIndex !== index) {
            const reorderedEmojis = [...emojis];
            const draggedEmoji = reorderedEmojis.splice(draggingIndex, 1)[0];
            reorderedEmojis.splice(index, 0, draggedEmoji);
            setEmojis(reorderedEmojis);
            setDraggingIndex(index);
        }
    };

    const handleDragEnd = () => {
        console.log('Reordered emojis:', emojis);
        setDraggingIndex(null);

        // update firestore
        reorderFirestore(emojis);
    };

    const handleDropOnDelete = () => {
        if (draggingIndex !== null) {
            if (draggingIndex == null || draggingIndex < 0 || draggingIndex >= emojis.length) {
                console.error("Invalid draggingIndex:", draggingIndex);
                return; // Abort operation if index is invalid
            }

            const updatedEmojis = emojis.filter((_, index) => index !== draggingIndex);
            setEmojis(updatedEmojis);
            setDraggingIndex(null);
            setEditingIndex(-1);

            // update firestore
            reorderFirestore(updatedEmojis);
        }
    };

    return (
        <div>
            {(showAddMenu && editingIndex == -1) && <AddEmojiMenu emojis={emojis} setEmojis={setEmojis} setShowAddMenu={setShowAddMenu} />}
            {editingIndex != -1 && <EditEmojiMenu editingIndex={editingIndex} setEditingIndex={setEditingIndex} emojis={emojis} setEmojis={setEmojis} />}

            {showSearch &&
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search emojis"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            }

            {auth.currentUser != null ? <>
                <h2>My Emojis</h2>
                <div className="emoji-grid">

                    {showEditButton &&
                        <div
                            className={`emoji-item ${draggingIndex !== null ? 'emoji-item-delete' : 'emoji-item-add'}`}
                            onClick={() => {
                                setEditingIndex(-1);
                                setShowAddMenu(!showAddMenu)
                            }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDropOnDelete}
                        >
                            {draggingIndex !== null ? '🗑️' : '📝'}
                        </div>
                    }

                    {/* Reverse the display order but keep the internal order intact */}
                    {filteredEmojis.slice().reverse().map((emoji, index) => {
                        const reversedIndex = emojis.length - 1 - index; // Correct index for drag-and-drop
                        return (
                            <div
                                key={reversedIndex}
                                className="emoji-item"
                                {...(showAddMenu ? { draggable: true } : {})}
                                onClick={() => {
                                    handleEmojiClick(emoji);
                                }}
                                onDragStart={() => { if (showAddMenu) handleDragStart(reversedIndex) }}
                                onDragOver={(e) => handleDragOver(e, reversedIndex)}
                                onDragEnd={handleDragEnd}
                            >
                                {emoji.emoji.length <= 2 ? (
                                    emoji.emoji
                                ) : (
                                    <img src={`https://cdn.discordapp.com/emojis/${emoji.emoji}?size=48`} alt="emoji" />
                                )}
                            </div>
                        );
                    })}
                </div>


            </> : <p>
                <span
                    onClick={() => setActiveTab('login')}
                    style={{
                        cursor: 'pointer',
                        color: '#007ACC', // Softer blue
                        textDecoration: 'none',
                        fontWeight: '500',
                        transition: 'color 0.3s ease',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.color = '#005F99')}
                    onMouseOut={(e) => (e.currentTarget.style.color = '#007ACC')}
                >
                    Log in
                </span>{' '}
                to add your own emojis
            </p>
            }



            {showPublicEmojis && !showAddMenu ? <>
                <h2>Public Emojis</h2>
                <div className="emoji-grid">
                    {filteredEmojisPublic.slice().reverse().map((emoji, index) => {
                        const reversedIndex = emojis.length - 1 - index; // Correct index for drag-and-drop
                        return (
                            <div
                                key={reversedIndex}
                                className="emoji-item"
                                {...(showAddMenu ? { draggable: true } : {})}
                                onClick={() => {
                                    handleEmojiClick(emoji);
                                }}
                                onDragStart={() => { if (showAddMenu) handleDragStart(reversedIndex) }}
                                onDragOver={(e) => handleDragOver(e, reversedIndex)}
                                onDragEnd={handleDragEnd}
                            >
                                {emoji.emoji.length <= 2 ? (
                                    emoji.emoji
                                ) : (
                                    <img src={`https://cdn.discordapp.com/emojis/${emoji.emoji}?size=48`} alt="emoji" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </> : null}

        </div>
    );
}

// Helper function to check file validity for multiple types
const checkFileType = async (emojiID: string, fileTypes: string[]) => {
    for (const type of fileTypes) {
        const isValid = await checkLinkValid(emojiID, type);
        if (isValid) {
            return type; // Return the first valid file type found
        }
    }
    return null; // No valid file type found
};

const checkLinkValid = async (emojiID: string, fileType: string) => {
    const url = `https://cdn.discordapp.com/emojis/${emojiID}.${fileType}?size=48`;

    try {
        const response = await fetch(url, { method: 'HEAD' });

        if (response.ok) {
            console.log(`Valid ${fileType.toUpperCase()} link:`, url);
            return true;  // The file exists
        } else {
            console.log(`Invalid ${fileType.toUpperCase()} link:`, url);
            return false; // The file doesn't exist or is not valid
        }
    } catch (error) {
        console.error("Error checking file link:", error);
        return false; // Something went wrong with the request
    }
};

function Click_AddEmojiButton(text: string, { emojis, setEmojis }: { emojis: { emoji: string, name: string }[]; setEmojis: (emojis: { emoji: string, name: string }[]) => void }) {
    const links = text.split(",");

    const newEmojis: { emoji: string, name: string }[] = [];

    // Add each emoji to the grid
    links.forEach(async (link) => {

        // if system emoji, add directly
        if (link.length <= 2) {
            if (link.length == 0) return;

            newEmojis.push({ emoji: link, name: "" });
            return;
        }

        let emojiID = "";
        let fileType = "";
        let name = "";

        // Parse the URL using URL API
        const url = new URL(link);
        const pathname = url.pathname; // /emojis/{emojiID}.{fileType}
        const queryParams = new URLSearchParams(url.search); // query string parameters

        // Extract emoji ID and file type from the pathname
        const pathParts = pathname.split('/');
        const emojiDetails = pathParts[pathParts.length - 1].split('.'); // Get file name part

        emojiID = emojiDetails[0]; // Emoji ID
        fileType = emojiDetails[1] || ""; // File type (gif, webp, etc.)

        // Extract name from query parameters if available
        name = queryParams.get('name') || "";

        // Decode URI-encoded characters in the name
        name = decodeURIComponent(name);

        // if unknown file type, try to figure it out
        if (fileType === "") {
            const validFileType = await checkFileType(emojiID, ["gif", "webp"]);
            if (validFileType) {
                fileType = validFileType;
            } else {
                console.log('Invalid ID or link:', link);
                return;
            }
        }

        // Add the emoji to the grid
        newEmojis.push({ emoji: `${emojiID}.${fileType}`, name: name });
    });

    // Update the state
    setEmojis([...emojis, ...newEmojis]);

    // add emoji to firestore (avoid cold start delay / api cost)

    const addEmojiFirestore = async (newEmojis: { emoji: string, name: string }[]) => {
        try {
            const user = auth.currentUser;
            if (!user) {
                console.error('No user found!');
                return;
            }

            const userDoc = await getDoc(doc(db, "userdata", user.uid));
            if (!userDoc.exists()) {
                console.error('No user data found!');
                return;
            }

            const data = userDoc.data() as { emojis?: { emoji: string, name: string }[] };
            if (!data.emojis) {
                // create new emojis field if it doesn't exist
                data.emojis = [];
            }

            data.emojis.push(...newEmojis); // Add new emojis to existing list
            updateDoc(doc(db, "userdata", user.uid), { emojis: data.emojis }).then(() => {
                ShowNotification("Saved");
            });

            setEmojis(data.emojis); // Update state with emojis from Firestore
        } catch (error) {
            console.error('Error fetching emojis:', error);
            // TODO: show error message
        }
    };

    if (newEmojis.length > 0) {
        addEmojiFirestore(newEmojis);
        ClearAddEmojiTextbox();
    }
    
}

function AddEmojiMenu({ emojis, setEmojis, setShowAddMenu }: {
    emojis: { emoji: string, name: string }[];
    setEmojis: (emojis: { emoji: string, name: string }[]) => void
    setShowAddMenu: (showAddMenu: boolean) => void
}) {
    const [emojiText, setEmojiText] = useState('');

    const emojiInputRef = React.useRef<HTMLInputElement>(null);
    ClearAddEmojiTextbox = () => {
        if (emojiInputRef.current) {
            emojiInputRef.current.value = "";
        }
    };

    return (
        <div className="menu-section">
            <h2>Add Emoji</h2>
            <div className="input-group">
                <input
                    type="text"
                    placeholder="emoji link"
                    ref={emojiInputRef}
                    onChange={(e) => setEmojiText(e.target.value)}
                />
                <button onClick={() => Click_AddEmojiButton(emojiText, { emojis, setEmojis })}>Add</button>

                <button className="back-button"
                    onClick={() => {
                        setShowAddMenu(false);
                    }}
                >
                    Back
                </button>
            </div>
            {/* <br />
            <h1>Edit Emoji</h1>
            <span>Drag and drop to re-order or delete</span><br />
            <span>Click to rename</span> */}
            <p>To get an emoji&apos;s link: Right-click in chat, Copy link</p>
        </div>
    );
}

function EditEmojiMenu({
    editingIndex,
    setEditingIndex,
    emojis,
    setEmojis,
}: {
    editingIndex: number;
    setEditingIndex: (index: number) => void;
    emojis: { emoji: string; name: string }[];
    setEmojis: (emojis: { emoji: string; name: string }[]) => void;
}) {
    const [name, setName] = useState('');
    const currentEmoji = emojis[editingIndex];

    useEffect(() => {
        // Update the `name` state whenever the editingIndex changes
        setName(emojis[editingIndex]?.name || '');
    }, [editingIndex, emojis]);

    const updateEmojiNameInFirestore = async (index: number, newName: string) => {
        try {
            const user = auth.currentUser;
            if (!user) {
                console.error('No user found!');
                return;
            }

            const userDocRef = doc(db, 'userdata', user.uid);
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists()) {
                console.error('No user data found!');
                return;
            }

            const data = userDoc.data() as { emojis?: { emoji: string; name: string }[] };
            if (!data.emojis) {
                console.warn('No emojis field found in user data');
                return;
            }

            // Update the specific emoji's name
            data.emojis[index].name = newName;

            // Save back to Firestore
            await updateDoc(userDocRef, { emojis: data.emojis });

            // Update local state
            setEmojis(data.emojis);
            ShowNotification("Saved");
        } catch (error) {
            console.error('Error updating emoji name in Firestore:', error);
        }
    };

    return (
        <div className="menu-section">
            <h2>Edit Emoji</h2>

            {currentEmoji.emoji.length <= 2 ? (
                <div className="emoji-text"><span>{currentEmoji.emoji}</span></div>
            ) : (
                <img src={`https://cdn.discordapp.com/emojis/${currentEmoji.emoji}?size=48`} alt="emoji" className="emoji-image" />
            )}

            <div className="input-group">
                <input
                    onChange={(e) => setName(e.target.value)} // Update name state on input change
                    type="text"
                    placeholder="emoji name (for search)"
                    value={name} // Use the local state for input value
                />
                <button
                    onClick={() => {
                        const updatedEmojis = [...emojis];
                        updatedEmojis[editingIndex].name = name;
                        updateEmojiNameInFirestore(editingIndex, name); // Save to Firestore
                        setEmojis(updatedEmojis); // Update local state
                    }}
                >
                    Save
                </button>
                <button className="back-button"
                    onClick={() => {
                        setEditingIndex(-1);
                    }}
                >
                    Back
                </button>
            </div>

            <p>To re-order or delete: drag and drop</p>

        </div>
    );
}

export default EmojiGrid;