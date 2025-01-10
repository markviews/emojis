import React, { useEffect, useState } from "react";
import { db, auth } from './firebase';
import { ShowNotification } from "./notification";
import { getDoc, doc, updateDoc } from "firebase/firestore";

let ClearAddEmojiTextbox: () => void = () => { };

function EmojiGrid() {
    const [emojis, setEmojis] = useState<string[]>([]);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [editingIndex, setEditingIndex] = useState(-1);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

    const reorderFirestore = async (emojis: string[]) => {
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

        // Fetch emojis using cloud functions. Not using this due to cold start delay and cost
        // const getEmojis = httpsCallable(functions, 'getEmojis');
        // getEmojis()
        //     .then((result) => {
        //         console.log('Emojis fetched successfully:', result);
        //         const data = result.data as { emojis: string[] };
        //         setEmojis(data.emojis);
        //     })
        //     .catch((error) => {
        //         console.error('Error fetching emojis:', error);
        //         // TODO: show error message
        //     });
    }, []);

    // Fetch emojis directly from Firestore to avoid cold start delay
    const fetchEmojisFirestore = async () => {
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

            const data = userDoc.data() as { emojis?: string[] };
            if (!data.emojis) {
                console.warn('No emojis field found in user data');
                return;
            }

            setEmojis(data.emojis); // Update state with emojis from Firestore
        } catch (error) {
            console.error('Error fetching emojis:', error);
            // TODO: show error message
        }
    };

    const handleEmojiClick = (emoji: string) => {

        if (showAddMenu) {
            // edit emoji
            const index = emojis.indexOf(emoji);

            // if click same emoji, close edit menu
            if (index == editingIndex) {
                setEditingIndex(-1);
                return;
            }

            setEditingIndex(index);
            return;
        }

        if (emoji.length > 2) {
            emoji = `https://cdn.discordapp.com/emojis/${emoji}?size=48`;
        }
        navigator.clipboard.writeText(emoji);
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

        // call API
        // const reorderEmojis = httpsCallable(functions, 'reorderEmojis');
        // reorderEmojis({ emojis: emojis })
        //     .then(() => {
        //         ShowNotification("Saved");
        //     })
        //     .catch((error) => {
        //         console.error('Error reordering emojis:', error);
        //         // TODO show error message
        //     });

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

            // const deleteEmoji = httpsCallable(functions, 'removeEmojis');
            // deleteEmoji({ emojis: [emojis[draggingIndex]] }) // Send only the specific emoji to delete
            //     .then(() => {
            //         ShowNotification("Saved");
            //     })
            //     .catch((error) => {
            //         console.error('Error deleting emoji:', error);
            //         // TODO show error message
            //     });

            // update firestore
            reorderFirestore(updatedEmojis);
        }
    };

    return (
        <div>
            {showAddMenu && <AddEmojiMenu emojis={emojis} setEmojis={setEmojis} />}
            {editingIndex != -1 && <EditEmojiMenu editingIndex={editingIndex} emojis={emojis} setEmojis={setEmojis} />}

            <div className="emoji-grid">
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

                {/* Reverse the display order but keep the internal order intact */}
                {emojis.slice().reverse().map((emoji, index) => {
                    const reversedIndex = emojis.length - 1 - index; // Correct index for drag-and-drop
                    return (
                        <div
                            key={reversedIndex}
                            className="emoji-item"
                            {...(showAddMenu ? { draggable: true } : {})}
                            onClick={() => handleEmojiClick(emoji)}
                            onDragStart={() => { if (showAddMenu) handleDragStart(reversedIndex) }}
                            onDragOver={(e) => handleDragOver(e, reversedIndex)}
                            onDragEnd={handleDragEnd}
                        >
                            {emoji.length <= 2 ? (
                                emoji
                            ) : (
                                <img src={`https://cdn.discordapp.com/emojis/${emoji}?size=48`} alt="emoji" />
                            )}
                        </div>
                    );
                })}
            </div>
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

function Click_AddEmojiButton(text: string, { emojis, setEmojis }: { emojis: string[]; setEmojis: (emojis: string[]) => void }) {
    const links = text.split(",");

    const newEmojis: string[] = [];

    // Add each emoji to the grid
    links.forEach(async (link) => {

        // if system emoji, add directly
        if (link.length <= 2) {
            newEmojis.push(link);
            return;
        }

        let emojiID = "";
        let fileType = "";

        // Regular expression to capture emoji ID and file type separately (full URL, just ID.extension, or just ID)
        const regex = /(?:\/emojis\/|^)(\d+)(?:\.(\w+))?(?:\?|$)/;
        const match = link.trim().match(regex);
        if (match) {
            emojiID = match[1];
            fileType = match[2] || "";
        } else {
            console.log('Invalid ID or link:', link);
            return;
        }

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
        newEmojis.push(`${emojiID}.${fileType}`);
    });

    // Update the state
    setEmojis([...emojis, ...newEmojis]);

    // call API
    // const addEmojis = httpsCallable(functions, 'addEmojis');
    // addEmojis({ emojis: newEmojis })
    //     .then(() => {
    //         ShowNotification("Saved");
    //     })
    //     .catch((error) => {
    //         console.error('Error adding emojis:', error);
    //         // TODO show error message
    //     });

    // add emoji to firestore (avoid cold start delay / api cost)

    const addEmojiFirestore = async (newEmojis: string[]) => {
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

            const data = userDoc.data() as { emojis?: string[] };
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

    addEmojiFirestore(newEmojis);
    ClearAddEmojiTextbox();
}

function AddEmojiMenu({ emojis, setEmojis }: { emojis: string[]; setEmojis: (emojis: string[]) => void }) {
    const [emojiText, setEmojiText] = useState('');

    const emojiInputRef = React.useRef<HTMLInputElement>(null);
    ClearAddEmojiTextbox = () => {
        if (emojiInputRef.current) {
            emojiInputRef.current.value = "";
        }
    };

    return (
        <div className="addEmojiMenu">
            <h1>Add Emoji</h1>
            <span>To get an emoji&apos;s link: Right click in chat, Copy link</span>
            <br />
            <input
                ref={emojiInputRef}
                onChange={(e) => setEmojiText(e.target.value)}
                type="text"
                placeholder="emoji link"
            />
            <button
                onClick={() => Click_AddEmojiButton(emojiText, { emojis, setEmojis })}
            >Add</button>

            <br />
            <br />
            <h1>Edit Emoji</h1>
            <span>Drag and drop to re-order or delete</span><br />
            <span>Click to rename</span>
        </div>
    );
}

function EditEmojiMenu({
    editingIndex,
    emojis,
    setEmojis,
}: {
    editingIndex: number;
    emojis: string[];
    setEmojis: (emojis: string[]) => void;
}) {
    const [name, setName] = useState('');
    const currentEmoji = emojis[editingIndex];

    return (
        <div className="addEmojiMenu">
            <h1>Edit Emoji</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                    style={{
                        fontSize: '24px',
                        display: 'inline-block',
                        textAlign: 'center',
                        width: '40px',
                    }}
                >
                    {currentEmoji}
                </span>
                <input
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    placeholder="name"
                />
            </div>
            <button
                onClick={() => {
                    const updatedEmojis = [...emojis];
                    updatedEmojis[editingIndex] = name;
                    setEmojis(updatedEmojis);
                }}
            >
                Update
            </button>
        </div>
    );
}

export default EmojiGrid;