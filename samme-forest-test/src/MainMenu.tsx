import React, { useEffect, useMemo, useRef, useState } from "react";
import { Upload, Play, Trash2, LogIn, User, Image as ImageIcon, ArrowLeft, RefreshCw } from "lucide-react";
import { BabylonForestExplorer } from "./babylon/BabylonForestExplorer.mjs";

const API_BASE = "http://127.0.0.1:8000";
const UGA_RED = "#BA0C2F";
const UGA_BLACK = "#000000";
const UGA_SILVER = "#C8C9C7";
const UGA_CREAM = "#F7F4EF";

const initialSlots = [null, null, null];

function makeFakeUser(email) {
    const name = email?.split("@")[0] || "Player";
    return {
        email,
        displayName: name.charAt(0).toUpperCase() + name.slice(1),
    };
}

function resolveAssetUrl(path) {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${API_BASE}${path}`;
}

async function readJsonResponse(response, fallbackMessage) {
    let payload = null;

    try {
        payload = await response.json();
    } catch {
        
    }

    if (!response.ok) {
        throw new Error(payload?.detail || fallbackMessage);
    }

    return payload;
}

function statusColor(status) {
    if (status === "ready") return "#157347";
    if (status === "failed") return UGA_RED;
    return "#8a5a00";
}

function UgaButton({ children, variant = "primary", disabled = false, ...props }) {
    const styles = {
        primary: {
            background: disabled ? "#8d8d8d" : UGA_RED,
            color: "white",
            border: `1px solid ${disabled ? "#8d8d8d" : UGA_RED}`,
        },
        secondary: {
            background: "white",
            color: UGA_BLACK,
            border: `1px solid ${UGA_SILVER}`,
        },
        ghost: {
            background: "rgba(255,255,255,0.75)",
            color: UGA_BLACK,
            border: "1px solid rgba(0,0,0,0.08)",
        },
        danger: {
            background: "white",
            color: UGA_RED,
            border: "1px solid rgba(186, 12, 47, 0.3)",
        },
    };

    return (
        <button
            {...props}
            disabled={disabled}
            style={{
                ...styles[variant],
                borderRadius: 8,
                padding: "12px 18px",
                fontWeight: 700,
                fontSize: 15,
                cursor: disabled ? "not-allowed" : "pointer",
                transition: "all 160ms ease",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                boxShadow: disabled ? "none" : "0 10px 24px rgba(0,0,0,0.08)",
                ...props.style,
            }}
        >
            {children}
        </button>
    );
}

function Shell({ children }) {
    return (
        <div
            style={{
                minHeight: "100vh",
                background: `linear-gradient(180deg, ${UGA_CREAM} 0%, #ffffff 45%, #f5f5f5 100%)`,
                color: UGA_BLACK,
                fontFamily: "Inter, system-ui, sans-serif",
            }}
        >
            {children}
        </div>
    );
}

function TopBar({ onBack, showBack, user, onLogout }) {
    return (
        <div
            style={{
                position: "sticky",
                top: 0,
                zIndex: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 24px",
                background: "rgba(255,255,255,0.84)",
                backdropFilter: "blur(10px)",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {showBack ? (
                    <button
                        onClick={onBack}
                        style={{
                            border: "none",
                            background: "white",
                            borderRadius: 8,
                            width: 42,
                            height: 42,
                            cursor: "pointer",
                            boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                            display: "grid",
                            placeItems: "center",
                        }}
                    >
                        <ArrowLeft size={18} />
                    </button>
                ) : null}
                <div>
                    <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1.4, color: UGA_RED }}>SAMMe</div>
                    <div style={{ fontSize: 20, fontWeight: 900 }}>UGA Avatar Explorer</div>
                </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {user ? (
                    <>
                        <div
                            style={{
                                padding: "10px 14px",
                                borderRadius: 8,
                                background: "white",
                                boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
                                fontWeight: 600,
                                display: "flex",
                                gap: 8,
                                alignItems: "center",
                            }}
                        >
                            <User size={16} />
                            {user.displayName}
                        </div>
                        <UgaButton variant="secondary" onClick={onLogout}>Log out</UgaButton>
                    </>
                ) : null}
            </div>
        </div>
    );
}

function LoginPage({ email, setEmail, password, setPassword, onLogin, canPlay }) {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.15fr) minmax(320px, 0.85fr)",
                gap: 28,
                maxWidth: 1200,
                margin: "0 auto",
                padding: "40px 24px 56px",
            }}
        >
            <div
                style={{
                    background: UGA_RED,
                    borderRadius: 8,
                    color: "white",
                    padding: 36,
                    minHeight: 520,
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "0 24px 50px rgba(186,12,47,0.22)",
                }}
            >
                <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: 2 }}>UNIVERSITY OF GEORGIA</div>
                    <h1 style={{ fontSize: 52, lineHeight: 1.02, margin: "14px 0 18px", fontWeight: 900 }}>
                        Step into
                        <br />
                        your avatar.
                    </h1>
                    <p style={{ fontSize: 18, lineHeight: 1.6, maxWidth: 560, opacity: 0.95 }}>
                    Upload a full-body photo, select a saved look, and launch directly into the Babylon.js forest explorer.
                    </p>

                    <div
                        style={{
                            marginTop: 34,
                            display: "grid",
                            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                            gap: 16,
                        }}
                    >
                        {[
                            { title: "Login", text: "Authenticate before entering the experience." },
                            { title: "Upload", text: "Send a new image to the FastAPI backend." },
                            { title: "Generate", text: "Create and display the returned avatar record." },
                        ].map((item) => (
                            <div
                                key={item.title}
                                style={{
                                    background: "rgba(255,255,255,0.12)",
                                    border: "1px solid rgba(255,255,255,0.18)",
                                    borderRadius: 8,
                                    padding: 18,
                                }}
                            >
                                <div style={{ fontWeight: 800, marginBottom: 8 }}>{item.title}</div>
                                <div style={{ fontSize: 14, lineHeight: 1.5 }}>{item.text}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div
                style={{
                    background: "white",
                    borderRadius: 8,
                    padding: 28,
                    boxShadow: "0 18px 44px rgba(0,0,0,0.08)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                }}
            >
                <div>
                    <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Login</div>
                    <div style={{ color: "#555", lineHeight: 1.6, marginBottom: 24 }}>
                        This demo uses a frontend-only mock login. Any non-empty email and password will unlock Play.
                    </div>

                    <label style={{ display: "block", marginBottom: 14 }}>
                        <div style={{ fontWeight: 700, marginBottom: 8 }}>UGA Email</div>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="student@uga.edu"
                            style={inputStyle}
                        />
                    </label>

                    <label style={{ display: "block", marginBottom: 18 }}>
                        <div style={{ fontWeight: 700, marginBottom: 8 }}>Password</div>
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            type="password"
                            style={inputStyle}
                        />
                    </label>

                    <UgaButton onClick={onLogin} style={{ width: "100%" }}>
                        <LogIn size={18} />
                        Login to Continue
                    </UgaButton>
                </div>

                <div
                    style={{
                        marginTop: 24,
                        background: "#faf7f2",
                        border: "1px solid rgba(0,0,0,0.06)",
                        borderRadius: 8,
                        padding: 18,
                    }}
                >
                    <div style={{ fontWeight: 800, marginBottom: 8 }}>Launch Status</div>
                    <div style={{ color: "#555", marginBottom: 14 }}>Play stays disabled until the user logs in.</div>
                    <UgaButton disabled={!canPlay} style={{ width: "100%" }}>
                        <Play size={18} />
                        Play
                    </UgaButton>
                </div>
            </div>
        </div>
    );
}

function PhotoCard({ slot, index, onPlay, onDelete, onUploadToSlot, isBusy }) {
    const inputRef = useRef(null);

    return (
        <div
            style={{
                position: "relative",
                borderRadius: 8,
                overflow: "hidden",
                minHeight: 340,
                background: slot ? "#111" : "linear-gradient(180deg, #ffffff 0%, #f5f1eb 100%)",
                boxShadow: "0 16px 34px rgba(0,0,0,0.08)",
                border: "1px solid rgba(0,0,0,0.06)",
            }}
        >
            {slot ? (
                <>
                    <img
                        src={slot.src}
                        alt={slot.name}
                        style={{ width: "100%", height: 340, objectFit: "cover", display: "block" }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            top: 14,
                            left: 14,
                            background: "rgba(255,255,255,0.92)",
                            color: statusColor(slot.status),
                            borderRadius: 8,
                            padding: "7px 10px",
                            fontSize: 13,
                            fontWeight: 800,
                            textTransform: "uppercase",
                        }}
                    >
                        {slot.status || "processing"}
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.65) 100%)",
                            opacity: 0,
                            transition: "opacity 160ms ease",
                            display: "flex",
                            alignItems: "flex-end",
                            justifyContent: "space-between",
                            padding: 18,
                        }}
                        className="photo-overlay"
                    >
                        <div style={{ color: "white", fontWeight: 700, maxWidth: "52%" }}>{slot.name}</div>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                            <UgaButton variant="ghost" onClick={() => onPlay(index)}>
                                <Play size={18} />
                                Play
                            </UgaButton>
                            <UgaButton variant="danger" onClick={() => onDelete(index)}>
                                <Trash2 size={18} />
                                Delete
                            </UgaButton>
                        </div>
                    </div>
                </>
            ) : (
                <div
                    style={{
                        height: 340,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 14,
                        color: "#666",
                        padding: 24,
                        textAlign: "center",
                    }}
                >
                    <div
                        style={{
                            width: 72,
                            height: 72,
                            borderRadius: 8,
                            background: "rgba(186,12,47,0.08)",
                            display: "grid",
                            placeItems: "center",
                            color: UGA_RED,
                        }}
                    >
                        <ImageIcon size={32} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 18 }}>Empty Slot {index + 1}</div>
                        <div style={{ marginTop: 8, lineHeight: 1.6 }}>Upload a full-body image for avatar generation.</div>
                    </div>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => onUploadToSlot(index, e)}
                    />
                    <UgaButton disabled={isBusy} onClick={() => inputRef.current?.click()}>
                        <Upload size={18} />
                        {isBusy ? "Generating..." : "Upload Photo"}
                    </UgaButton>
                </div>
            )}
        </div>
    );
}

function AvatarList({ avatars }) {
    return (
        <div
            style={{
                marginTop: 34,
                borderTop: "1px solid rgba(0,0,0,0.08)",
                paddingTop: 24,
            }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: 1.4, color: UGA_RED }}>BACKEND RECORDS</div>
                    <h3 style={{ fontSize: 28, margin: "6px 0 0", fontWeight: 900 }}>Generated avatars</h3>
                </div>
                <div style={{ color: "#555", fontWeight: 700 }}>{avatars.length} saved</div>
            </div>

            {avatars.length === 0 ? (
                <div
                    style={{
                        marginTop: 18,
                        background: "white",
                        border: "1px solid rgba(0,0,0,0.06)",
                        borderRadius: 8,
                        padding: 18,
                        color: "#555",
                    }}
                >
                    No backend avatar records yet.
                </div>
            ) : (
                <div
                    style={{
                        marginTop: 18,
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                        gap: 16,
                    }}
                >
                    {avatars.map((avatar) => (
                        <div
                            key={avatar.id}
                            style={{
                                background: "white",
                                border: "1px solid rgba(0,0,0,0.06)",
                                borderRadius: 8,
                                overflow: "hidden",
                                boxShadow: "0 12px 26px rgba(0,0,0,0.06)",
                            }}
                        >
                            {avatar.imageUrl ? (
                                <img
                                    src={resolveAssetUrl(avatar.imageUrl)}
                                    alt={`Avatar ${avatar.id}`}
                                    style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }}
                                />
                            ) : null}
                            <div style={{ padding: 14 }}>
                                <div style={{ fontWeight: 900, overflowWrap: "anywhere" }}>{avatar.id}</div>
                                <div
                                    style={{
                                        marginTop: 8,
                                        color: statusColor(avatar.status),
                                        fontWeight: 800,
                                        textTransform: "uppercase",
                                        fontSize: 13,
                                    }}
                                >
                                    {avatar.status || "processing"}
                                </div>
                                <div style={{ marginTop: 8, color: "#666", fontSize: 13 }}>
                                    Model: {avatar.modelUrl || "not ready"}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function SelectionPage({
    slots,
    selectedIndex,
    onUploadNew,
    onUploadToSlot,
    onDelete,
    onPlaySlot,
    onLaunch,
    canLaunch,
    isBusy,
    error,
    avatars,
    onRefreshAvatars,
}) {
    const hiddenInputRef = useRef(null);

    return (
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "34px 24px 56px" }}>
            <style>{`
                .photo-grid-card:hover .photo-overlay { opacity: 1 !important; }
                @media (max-width: 900px) {
                    .selection-grid { grid-template-columns: 1fr !important; }
                    .selection-header { align-items: stretch !important; }
                }
            `}</style>

            <div
                className="selection-header"
                style={{
                    display: "flex",
                    alignItems: "end",
                    justifyContent: "space-between",
                    gap: 18,
                    marginBottom: 26,
                    flexWrap: "wrap",
                }}
            >
                <div>
                    <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: 1.4, color: UGA_RED }}>PHOTO SELECT</div>
                    <h2 style={{ fontSize: 42, lineHeight: 1.05, margin: "8px 0 10px", fontWeight: 900 }}>
                        Choose your avatar source
                    </h2>
                    <div style={{ color: "#555", fontSize: 17, lineHeight: 1.6, maxWidth: 740 }}>
                        Upload a full-body photo, send it through the backend mock generator, and view the returned avatar
                        record.
                    </div>
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <input
                        ref={hiddenInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={onUploadNew}
                    />
                    <UgaButton variant="secondary" disabled={isBusy} onClick={() => hiddenInputRef.current?.click()}>
                        <Upload size={18} />
                        {isBusy ? "Generating..." : "Upload New Photo"}
                    </UgaButton>
                    <UgaButton variant="secondary" disabled={isBusy} onClick={onRefreshAvatars}>
                        <RefreshCw size={18} />
                        Refresh
                    </UgaButton>
                    <UgaButton disabled={!canLaunch || isBusy} onClick={onLaunch}>
                        <Play size={18} />
                        Launch Explorer
                    </UgaButton>
                </div>
            </div>

            {error ? (
                <div
                    style={{
                        background: "#fff3f4",
                        border: "1px solid rgba(186, 12, 47, 0.24)",
                        color: UGA_RED,
                        borderRadius: 8,
                        padding: 14,
                        marginBottom: 20,
                        fontWeight: 700,
                    }}
                >
                    {error}
                </div>
            ) : null}

            <div
                className="selection-grid"
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: 22,
                }}
            >
                {slots.map((slot, index) => (
                    <div key={index} className="photo-grid-card">
                        <PhotoCard
                            slot={slot}
                            index={index}
                            onPlay={onPlaySlot}
                            onDelete={onDelete}
                            onUploadToSlot={onUploadToSlot}
                            isBusy={isBusy}
                        />
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginTop: 12,
                                padding: "0 4px",
                            }}
                        >
                            <div style={{ fontWeight: 800 }}>Slot {index + 1}</div>
                            <div
                                style={{
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: selectedIndex === index ? UGA_RED : "#777",
                                }}
                            >
                                {selectedIndex === index ? "READY TO PLAY" : slot ? (slot.status || "SAVED").toUpperCase() : "EMPTY"}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <AvatarList avatars={avatars} />
        </div>
    );
}

function ExplorerPage({ selectedPhoto, onExit }) {
    return (
        <div style={{ width: "100vw", height: "100vh", position: "relative", background: "#dbeeff" }}>
            <div
                style={{
                    position: "absolute",
                    top: 20,
                    left: 20,
                    zIndex: 30,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                }}
            >
                <UgaButton variant="secondary" onClick={onExit}>
                    <ArrowLeft size={18} />
                    Back to Menu
                </UgaButton>
                {selectedPhoto ? (
                    <div
                        style={{
                            background: "rgba(255,255,255,0.9)",
                            borderRadius: 8,
                            padding: "10px 14px",
                            boxShadow: "0 10px 22px rgba(0,0,0,0.08)",
                            fontWeight: 700,
                        }}
                    >
                        Using: {selectedPhoto.name}
                    </div>
                ) : null}
            </div>

            <BabylonForestExplorer
                options={{
                    worldSize: 280,
                    treeCount: 420,
                    showDebugCapsule: false,
                }}
                onSceneReady={(explorer) => {
                    console.log("Explorer launched", explorer);
                }}
            />
        </div>
    );
}

const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 8,
    border: "1px solid rgba(0,0,0,0.12)",
    outline: "none",
    fontSize: 15,
    background: "#fff",
};

export default function MainMenu() {
    const [page, setPage] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [user, setUser] = useState(null);
    const [slots, setSlots] = useState(initialSlots);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [avatars, setAvatars] = useState([]);
    const [isBusy, setIsBusy] = useState(false);
    const [error, setError] = useState("");

    const selectedPhoto = useMemo(() => {
        if (selectedIndex == null) return null;
        return slots[selectedIndex] ?? null;
    }, [slots, selectedIndex]);

    const fetchAvatars = async () => {
        const response = await fetch(`${API_BASE}/avatars`);
        const data = await readJsonResponse(response, "Could not load avatars.");
        setAvatars(Array.isArray(data) ? data : []);
        return Array.isArray(data) ? data : [];
    };

    useEffect(() => {
        if (page !== "select") return;

        fetchAvatars().catch((err) => {
            setError(err.message || "Could not load avatars.");
        });
    }, [page]);

    const handleLogin = () => {
        if (!email.trim() || !password.trim()) return;
        setUser(makeFakeUser(email.trim()));
    };

    const handleLogout = () => {
        setUser(null);
        setPage("login");
    };

    const runAvatarPipeline = async (file, preferredSlotIndex = null) => {
        if (!file) return;

        setIsBusy(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("file", file);

            const uploadRes = await fetch(`${API_BASE}/upload`, {
                method: "POST",
                body: formData,
            });
            const uploaded = await readJsonResponse(uploadRes, "Upload failed.");

            const generateRes = await fetch(`${API_BASE}/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: uploaded.id }),
            });
            const generated = await readJsonResponse(generateRes, "Generation failed.");

            const refreshedAvatars = await fetchAvatars();
            const record = refreshedAvatars.find((avatar) => avatar.id === generated.id) || generated || uploaded;

            setSlots((prev) => {
                const next = [...prev];
                const firstOpenIndex = next.findIndex((x) => x === null);
                const insertAt = preferredSlotIndex ?? (firstOpenIndex === -1 ? 0 : firstOpenIndex);
                next[insertAt] = {
                    id: record.id,
                    name: file.name,
                    src: resolveAssetUrl(record.imageUrl),
                    status: record.status,
                    imageUrl: record.imageUrl,
                    modelUrl: record.modelUrl,
                };
                setSelectedIndex(insertAt);
                return next;
            });
        } catch (err) {
            setError(err.message || "Something went wrong while generating the avatar.");
        } finally {
            setIsBusy(false);
        }
    };

    const handleUploadNew = async (event) => {
        const file = event.target.files?.[0];
        await runAvatarPipeline(file);
        event.target.value = "";
    };

    const handleUploadToSlot = async (slotIndex, event) => {
        const file = event.target.files?.[0];
        await runAvatarPipeline(file, slotIndex);
        event.target.value = "";
    };

    const handleDelete = (slotIndex) => {
        setSlots((prev) => {
            const next = [...prev];
            next[slotIndex] = null;
            return next;
        });
        setSelectedIndex((prev) => (prev === slotIndex ? null : prev));
    };

    const handlePlaySlot = (slotIndex) => {
        if (!slots[slotIndex]) return;
        setSelectedIndex(slotIndex);
        setPage("explorer");
    };

    const handleRefreshAvatars = async () => {
        setError("");
        setIsBusy(true);
        try {
            await fetchAvatars();
        } catch (err) {
            setError(err.message || "Could not load avatars.");
        } finally {
            setIsBusy(false);
        }
    };

    const canPlay = Boolean(user);
    const canLaunch = selectedPhoto != null;

    if (page === "explorer") {
        return <ExplorerPage selectedPhoto={selectedPhoto} onExit={() => setPage("select")} />;
    }

    return (
        <Shell>
            <TopBar
                showBack={page === "select"}
                onBack={() => setPage("login")}
                user={user}
                onLogout={handleLogout}
            />

            {page === "login" ? (
                <>
                    <LoginPage
                        email={email}
                        setEmail={setEmail}
                        password={password}
                        setPassword={setPassword}
                        onLogin={handleLogin}
                        canPlay={canPlay}
                    />

                    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 48px" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <UgaButton disabled={!canPlay} onClick={() => setPage("select")}>
                                <Play size={18} />
                                Play
                            </UgaButton>
                        </div>
                    </div>
                </>
            ) : (
                <SelectionPage
                    slots={slots}
                    selectedIndex={selectedIndex}
                    onUploadNew={handleUploadNew}
                    onUploadToSlot={handleUploadToSlot}
                    onDelete={handleDelete}
                    onPlaySlot={handlePlaySlot}
                    onLaunch={() => setPage("explorer")}
                    canLaunch={canLaunch}
                    isBusy={isBusy}
                    error={error}
                    avatars={avatars}
                    onRefreshAvatars={handleRefreshAvatars}
                />
            )}
        </Shell>
    );
}
