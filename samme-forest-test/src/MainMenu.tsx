import React, { useMemo, useRef, useState } from "react";
import { Upload, Play, Trash2, LogIn, User, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { BabylonForestExplorer } from "./babylon/BabylonForestExplorer.mjs";

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

function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
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
            border: `1px solid rgba(0,0,0,0.08)`,
        },
        danger: {
            background: "white",
            color: UGA_RED,
            border: `1px solid rgba(186, 12, 47, 0.3)`,
        },
    };

    return (
        <button
            {...props}
    disabled={disabled}
    style={{
    ...styles[variant],
            borderRadius: 16,
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
            borderRadius: 14,
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
        borderRadius: 999,
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
            gridTemplateColumns: "1.15fr 0.85fr",
            gap: 28,
            maxWidth: 1200,
            margin: "0 auto",
            padding: "40px 24px 56px",
    }}
>
    <div
        style={{
        background: `linear-gradient(135deg, ${UGA_RED} 0%, #8f0d28 100%)`,
            borderRadius: 32,
            color: "white",
            padding: 36,
            minHeight: 520,
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 24px 50px rgba(186,12,47,0.22)",
    }}
>
    <div
        style={{
        position: "absolute",
            right: -60,
            top: -40,
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
    }}
    />
    <div
    style={{
        position: "absolute",
            left: -40,
            bottom: -60,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
    }}
    />

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
        { title: "Choose Photo", text: "Upload a new image or pick from saved slots." },
        { title: "Play", text: "Launch your avatar into the explorable environment." },
    ].map((item) => (
        <div
            key={item.title}
        style={{
        background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 22,
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
            borderRadius: 32,
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
            borderRadius: 22,
            padding: 18,
    }}
>
    <div style={{ fontWeight: 800, marginBottom: 8 }}>Launch Status</div>
    <div style={{ color: "#555", marginBottom: 14 }}>
    Play stays disabled until the user logs in.
    </div>
    <UgaButton disabled={!canPlay} style={{ width: "100%" }}>
    <Play size={18} />
    Play
    </UgaButton>
    </div>
    </div>
    </div>
);
}

function PhotoCard({ slot, index, onPlay, onDelete, onUploadToSlot }) {
    const inputRef = useRef(null);

    return (
        <div
            style={{
        position: "relative",
            borderRadius: 26,
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
        <div style={{ color: "white", fontWeight: 700, maxWidth: "60%" }}>{slot.name}</div>
    <div style={{ display: "flex", gap: 10 }}>
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
            borderRadius: "50%",
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
        <UgaButton onClick={() => inputRef.current?.click()}>
        <Upload size={18} />
        Upload Photo
    </UgaButton>
    </div>
    )}
    </div>
);
}

function SelectionPage({ slots, selectedIndex, onUploadNew, onUploadToSlot, onDelete, onPlaySlot, onLaunch, canLaunch }) {
    const hiddenInputRef = useRef(null);

    return (
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "34px 24px 56px" }}>
    <style>{`
        .photo-grid-card:hover .photo-overlay { opacity: 1 !important; }
      `}</style>

    <div
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
    Upload a new full-body photo or select one of up to three saved images. Hover over an image to play with it or delete it.
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
    <UgaButton variant="secondary" onClick={() => hiddenInputRef.current?.click()}>
    <Upload size={18} />
    Upload New Photo
    </UgaButton>
    <UgaButton disabled={!canLaunch} onClick={onLaunch}>
    <Play size={18} />
    Launch Explorer
    </UgaButton>
    </div>
    </div>

    <div
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
        {selectedIndex === index ? "READY TO PLAY" : slot ? "SAVED" : "EMPTY"}
        </div>
        </div>
        </div>
    ))}
    </div>
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
        borderRadius: 16,
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
    borderRadius: 16,
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

    const selectedPhoto = useMemo(() => {
        if (selectedIndex == null) return null;
        return slots[selectedIndex] ?? null;
    }, [slots, selectedIndex]);

    const handleLogin = () => {
        if (!email.trim() || !password.trim()) return;
        setUser(makeFakeUser(email.trim()));
    };

    const handleLogout = () => {
        setUser(null);
        setPage("login");
    };

    const putFileInFirstOpenSlot = async (file) => {
        if (!file) return;
        const src = await fileToDataUrl(file);
        setSlots((prev) => {
            const next = [...prev];
            const idx = next.findIndex((x) => x === null);
            const insertAt = idx === -1 ? 0 : idx;
            next[insertAt] = {
                id: `${Date.now()}_${insertAt}`,
                name: file.name,
                src,
            };
            setSelectedIndex(insertAt);
            return next;
        });
    };

    const handleUploadNew = async (event) => {
        const file = event.target.files?.[0];
        await putFileInFirstOpenSlot(file);
        event.target.value = "";
    };

    const handleUploadToSlot = async (slotIndex, event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const src = await fileToDataUrl(file);
        setSlots((prev) => {
            const next = [...prev];
            next[slotIndex] = {
                id: `${Date.now()}_${slotIndex}`,
                name: file.name,
                src,
            };
            return next;
        });
        setSelectedIndex(slotIndex);
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
        <div
            style={{
        display: "flex",
            justifyContent: "flex-end",
    }}
    >
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
        />
    )}
    </Shell>
);
}
