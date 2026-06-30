import React, { useState, useRef, useEffect, useMemo, ReactNode, Ref } from "react";
import {
    ChevronDown,
    X,
    ChevronLeft,
    RotateCcw,
    ImageOff,
    House,
    Activity,
    Check,
    Minus,
} from "lucide-react";
import Tokens from "./components/tokens";
import ManagementSection from "./components/stroke/managementSection";
/* ----------------------------------------------------------------------
   Design tokens
   Warm paper background instead of clinical white, deep teal for the
   primary clinical action, and a reserved red used only for urgency
   (BETA flag, severe-score states) — stroke care is time-critical, so
   red is meaningful here rather than decorative.
------------------------------------------------------------------------- */
const T = {
    paper: "#F6F7F9",
    card: "#FFFFFF",
    ink: "#1C2420",
    muted: "#736B5C",
    border: "#E4DDCF",
    teal: "#0D7A72",
    tealSoft: "#E4F1EE",
    amber: "#B5832B",
    amberSoft: "#FBF1DF",
    red: "#C03B2B",
    redSoft: "#FBE9E6",
};

function severityFor({ total }: { total: number }) {
    if (total === 0)
        return { label: "No stroke", sub: "No stroke symptoms", color: T.teal, bg: T.tealSoft };
    if (total <= 4)
        return { label: "Minor stroke", sub: "Minor stroke", color: T.teal, bg: T.tealSoft };
    if (total <= 15)
        return { label: "Moderate stroke", sub: "Moderate stroke", color: T.amber, bg: T.amberSoft };
    if (total <= 20)
        return { label: "Moderate to severe", sub: "Moderate to severe", color: T.amber, bg: T.amberSoft };
    return { label: "อาการรุนแรง", sub: "Severe stroke", color: T.red, bg: T.redSoft };
}

/* ----------------------------------------------------------------------
   Small building blocks
------------------------------------------------------------------------- */
function Eyebrow({ children, tone = "muted" }: { children: ReactNode, tone: string }) {
    return (
        <p
            className="text-[11px] font-bold uppercase mb-1"
            style={{ color: tone === "teal" ? T.teal : T.muted, letterSpacing: "0.08em" }}
        >
            {children}
        </p>
    );
}

function Modal({ open, onClose, title, children }: { open: boolean, onClose?: (e: React.MouseEvent) => void, title: string, children: ReactNode }) {
    useEffect(() => {
        if (!open) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                //onClose(e);
            }
        };

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(20,18,14,0.45)", backdropFilter: "blur(2px)" }}
            onClick={onClose}
        >
            <div
                className="w-full max-w-sm rounded-2xl p-5 shadow-xl"
                style={{ background: T.card, border: `1px solid ${T.border}` }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-3 mb-3">
                    <h4 className="text-sm font-bold" style={{ color: T.ink }}>{title}</h4>
                    <button
                        onClick={onClose}
                        aria-label="ปิด"
                        className="rounded-full p-1 -mt-1 -mr-1 focus-visible:outline focus-visible:outline-2"
                        style={{ color: T.muted, outlineColor: T.teal }}
                    >
                        <X size={16} />
                    </button>
                </div>
                <div className="text-sm leading-relaxed" style={{ color: T.ink }}>{children}</div>
            </div>
        </div>
    );
}

function DefinedTerm({ term, title, children }: { term: string, title: string, children: ReactNode }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <span

                onClick={(e) => { e.stopPropagation(); setOpen(true) }}
                className="font-semibold underline decoration-dotted underline-offset-2 focus-visible:outline focus-visible:outline-2"
                style={{ color: T.teal, outlineColor: T.teal }}
            >
                {term}
            </span>
            <Modal open={open} onClose={(e) => { e.stopPropagation(); setOpen(false) }} title={title ?? term}>
                {children}
            </Modal>
        </>
    );
}

/** Image reference used inside an item — opens in a modal, and degrades
 *  gracefully with a clear placeholder if the asset isn't wired up yet. */
function ImageRef({ label, src, alt }: { label: string, src: string, alt: string }) {
    const [broken, setBroken] = useState(false);
    return (
        <DefinedTerm term={label} title={alt}>
            {broken ? (
                <div
                    className="flex flex-col items-center justify-center gap-2 rounded-lg py-8 text-center"
                    style={{ background: T.paper, border: `1px dashed ${T.border}`, color: T.muted }}
                >
                    <ImageOff size={20} />
                    <p className="text-xs px-4">
                        ไม่พบรูปภาพ — แทนที่ไฟล์ <code className="font-mono">{src}</code> ด้วยรูปจริง
                    </p>
                </div>
            ) : (
                <img
                    src={src}
                    alt={alt}
                    onError={() => setBroken(true)}
                    className="w-full rounded-lg"
                    style={{ border: `1px solid ${T.border}` }}
                />
            )}
        </DefinedTerm>
    );
}

function Note({ children }: { children: ReactNode }) {
    return (
        <p
            className="text-[13px] leading-relaxed rounded-lg px-3 py-2 mb-3"
            style={{ background: T.paper, color: T.muted, border: `1px solid ${T.border}` }}
        >
            {children}
        </p>
    );
}
type Option = {
    value: string;
    score: number | null;
    label: ReactNode;
    un?: boolean;
};



/* ----------------------------------------------------------------------
   Item content — transcribed from the original Thai NIHSS reference.
   Scoring bugs in the source (duplicate/incorrect `value`s on items
   5a, 5b, 6a, 6b, 7, 8, 9, 10, 11, plus a mis-pasted label on item 10)
   are corrected here so the live total is clinically accurate.
------------------------------------------------------------------------- */
const MOTOR_ARM_OPTIONS = [
    { value: "0", score: 0, label: "0 — แขนยกได้เต็ม 10 วินาที" },
    { value: "1", score: 1, label: "1 — ยกค้างไม่ถึง 10 วินาที แต่ยังไม่ตกลงเตียง" },
    { value: "2", score: 2, label: "2 — ยกได้แต่ตกลงเตียงภายใน 10 วินาที" },
    { value: "3", score: 3, label: "3 — ไม่สามารถยกขึ้นได้ แต่กล้ามเนื้อเคลื่อนไหวเล็กน้อย" },
    { value: "4", score: 4, label: "4 — ไม่มีการเคลื่อนไหวของกล้ามเนื้อเลย" },
    { value: "UN", score: null, label: "UN — แขนถูกตัดขาด / Joint stiffness", un: true },
];
const MOTOR_LEG_OPTIONS = [
    { value: "0", score: 0, label: "0 — ขายกได้เต็ม 5 วินาที" },
    { value: "1", score: 1, label: "1 — ยกค้างไม่ถึง 5 วินาที แต่ยังไม่ตกลงเตียง" },
    { value: "2", score: 2, label: "2 — ยกได้แต่ตกลงเตียงภายใน 5 วินาที" },
    { value: "3", score: 3, label: "3 — ไม่สามารถยกขึ้นได้ แต่กล้ามเนื้อเคลื่อนไหวเล็กน้อย" },
    { value: "4", score: 4, label: "4 — ไม่มีการเคลื่อนไหวของกล้ามเนื้อเลย" },
    { value: "UN", score: null, label: "UN — ขาถูกตัดขาด / Joint stiffness", un: true },
];

function useItems() {
    return useMemo(
        () => [
            {
                id: "1a",
                number: "1a",
                title: "ระดับความรู้สึกตัว",
                sub: "Level of consciousness",
                options: [
                    { value: "0", score: 0, label: "0 — รู้สึกตัวดี ตอบสนองปกติ" },
                    { value: "1", score: 1, label: "1 — ง่วงซึม ปลุกตื่นง่าย เมื่อตื่นถามตอบรู้เรื่อง ทำตามสั่งได้" },
                    { value: "2", score: 2, label: "2 — หลับตลอดเวลา ปลุกด้วยแรงกระตุ้นซ้ำๆ หรือต้องทำให้เกิดความเจ็บปวด" },
                    {
                        value: "3",
                        score: 3,
                        label: (
                            <>
                                3 — ไม่ตอบสนอง อาจพบ{" "}
                                <DefinedTerm term="reflexive posturing" title="Reflexive Posturing">
                                    <p>
                                        Involuntary abnormal posturing (e.g. decorticate or decerebrate
                                        posturing) in response to painful stimuli.
                                    </p>
                                </DefinedTerm>{" "}
                                ได้
                            </>
                        ),
                    },
                ],
            },
            {
                id: "1b",
                number: "1b",
                title: "คำถาม",
                sub: "LOC questions",
                note: (
                    <>
                        ประกอบด้วย 2 คำถาม
                        <ol className="list-decimal pl-6">
                            <li> ปัจจุบันเดือนอะไร?</li>
                            <li>ผู้ป่วยอายุเท่าไร?</li>
                        </ol>
                        คำตอบต้องถูกต้อง ใกล้เคียงไม่นับ
                        หากซึมจนตอบคำถามไม่ได้ให้ 2 คะแนน หากไม่สามารถพูดได้เพราะใส่ท่อช่วยหายใจหรือไม่เข้าใจภาษาหรือด้วยสาเหตุอื่นที่ไม่ใช่
                        aphasia ให้ 1 คะแนน
                    </>
                ),
                options: [
                    { value: "0", score: 0, label: "0 — ตอบถูกทั้ง 2 ข้อ" },
                    { value: "1", score: 1, label: "1 — ตอบถูก 1 ข้อ" },
                    { value: "2", score: 2, label: "2 — ตอบผิดทั้ง 2 ข้อ" },
                ],
            },
            {
                id: "1c",
                number: "1c",
                title: "คำสั่ง",
                sub: "LOC commands",
                note: (
                    <ul className="list-disc pl-6">
                        <li>สั่งให้หลับตาและลืมตา </li>
                        <li>สั่งให้กำมือและแบมือ (ข้างที่ไม่อ่อนแรง)</li>
                        <li>ดูการทำตามคำสั่งเป็นหลัก ไม่ดูความอ่อนแรง</li>
                    </ul>
                ),
                options: [
                    { value: "0", score: 0, label: "0 — ทำได้ทั้ง 2 อย่าง" },
                    { value: "1", score: 1, label: "1 — ทำได้ 1 อย่าง" },
                    { value: "2", score: 2, label: "2 — ไม่ทำตามหรือทำไม่ถูกต้อง" },
                ],
            },
            {
                id: "2",
                number: "2",
                title: "การเคลื่อนไหวของตา",
                sub: "Best gaze",
                note: "ทดสอบการมองตามในแนวนอนเท่านั้น หากมี isolated CN III, IV, VI paresis ให้ 1 คะแนน",
                options: [
                    { value: "0", score: 0, label: "0 — มองตามปกติ" },
                    { value: "1", score: 1, label: "1 — ตาข้างใดข้างหนึ่งหรือสองข้างเหลือบไปด้านข้างได้ แต่ไม่สุด" },
                    {
                        value: "2",
                        score: 2,
                        label: (
                            <>
                                2 — เหลือบมองด้านข้างไม่ได้เลย หรือมองไปด้านหนึ่งด้านใดจนสุด โดยไม่สามารถแก้ไขได้ด้วย{" "}
                                <ImageRef label="oculocephalic maneuver" src="oculocephalic_reflex.jpg" alt="Oculocephalic reflex" />

                            </>
                        ),
                    },
                ],
            },
            {
                id: "3",
                number: "3",
                title: "ลานสายตา",
                sub: "Visual fields",
                note: "วิธีการตรวจอาจใช้ side confrontation, finger counting, visual threat",
                options: [
                    { value: "0", score: 0, label: "0 — ลานสายตาปกติ" },
                    { value: "1", score: 1, label: "1 — Partial hemianopia" },
                    { value: "2", score: 2, label: "2 — Complete hemianopia" },
                    { value: "3", score: 3, label: "3 — มองไม่เห็นทั้ง 2 ข้าง" },
                ],
            },
            {
                id: "4",
                number: "4",
                title: "Facial palsy",
                sub: "ใบหน้าอ่อนแรง",
                note: (
                    <>
                        <ul className="list-disc pl-6">
                            <li>ดูกล้ามเนื้อใบหน้าขณะสั่งให้ยิงฟัน ยักคิ้ว หลับตาแน่น</li>
                            <li>สามารถสาธิตให้ทำตามได้</li>
                            <li>ถ้าไม่ตอบสนองใช้การกระตุ้น pain แล้วสังเกตใบหน้า</li>
                        </ul>
                        <img src="facial_palsy.png" />
                    </>

                ),
                options: [
                    { value: "0", score: 0, label: "0 — ปกติ" },
                    { value: "1", score: 1, label: "1 — อ่อนแรงเล็กน้อย (มุมปากตก, flattened nasolabial fold)" },
                    { value: "2", score: 2, label: "2 — อ่อนแรงแต่ยังเคลื่อนไหวได้บ้าง (total or near-total lower face paralysis)" },
                    { value: "3", score: 3, label: "3 — ไม่มีการเคลื่อนไหวของใบหน้าข้างใดข้างหนึ่งหรือสองข้างเลย (complete paralysis), coma" },
                ],
            },
            {
                id: "5a",
                number: "5a",
                title: "Motor arm — แขนซ้าย",
                sub: "Left arm",
                note: "ให้ผู้ป่วยยกแขน 90° ในท่านั่ง หรือ 45° ในท่านอน คว่ำมือ นับออกเสียง 1 ถึง 10",
                options: MOTOR_ARM_OPTIONS,
            },
            {
                id: "5b",
                number: "5b",
                title: "Motor arm — แขนขวา",
                sub: "Right arm",
                note: "ให้ผู้ป่วยยกแขน 90° ในท่านั่ง หรือ 45° ในท่านอน คว่ำมือ นับออกเสียง 1 ถึง 10",
                options: MOTOR_ARM_OPTIONS,
            },
            {
                id: "6a",
                number: "6a",
                title: "Motor leg — ขาซ้าย",
                sub: "Left leg",
                note: "นอนหงาย ยกขาให้สะโพกทำมุม 30° นับออกเสียง 1 ถึง 5",
                options: MOTOR_LEG_OPTIONS,
            },
            {
                id: "6b",
                number: "6b",
                title: "Motor leg — ขาขวา",
                sub: "Right leg",
                note: "นอนหงาย ยกขาให้สะโพกทำมุม 30° นับออกเสียง 1 ถึง 5",
                options: MOTOR_LEG_OPTIONS,
            },
            {
                id: "7",
                number: "7",
                title: "Limb ataxia",
                sub: "การเสียสมดุลของแขนขา",
                note: "ตรวจ finger-to-nose และ heel-to-shin หากผู้ป่วยมองไม่เห็น ให้เหยียดแขนและแตะจมูกตัวเอง",
                options: [
                    { value: "0", score: 0, label: "0 — ไม่มี ataxia" },
                    { value: "0u", score: 0, label: "0 — มี paralysis หรือ coma หรือไม่เข้าใจคำสั่ง" },
                    { value: "1", score: 1, label: "1 — มี ataxia ที่แขนหรือขา 1 ข้าง" },
                    { value: "2", score: 2, label: "2 — มี ataxia ที่แขนหรือขา 2 ข้าง" },
                    { value: "UN", score: null, label: "UN — แขน/ขาถูกตัดขาด / joint stiffness", un: true },
                ],
            },
            {
                id: "8",
                number: "8",
                title: "Sensory",
                sub: "การรับความรู้สึก",
                note: "ตรวจ pinprick sensation ที่ใบหน้า ลำตัว แขนขา (ไม่ทดสอบที่มือและเท้า) ถ้าผู้ป่วยมี bilateral loss of sensation จาก brainstem stroke ให้ 2 คะแนน",
                options: [
                    { value: "0", score: 0, label: "0 — ปกติ รู้สึกเท่ากันทั้งสองข้าง" },
                    { value: "1", score: 1, label: "1 — ความรู้สึกลดลง แต่ผู้ป่วยยังรู้สึกว่าถูกสัมผัส" },
                    { value: "2", score: 2, label: "2 — สูญเสียมาก ไม่รู้สึกว่าถูกสัมผัส / coma" },
                ],
            },
            {
                id: "9",
                number: "9",
                title: "Best language",
                sub: "ภาษา",
                note: (
                    <>
                        Describe: ให้ผู้ป่วยดูรูปและอธิบายรูป — <ImageRef label="แสดงรูป" src="language1.png" alt="อธิบายเหตุการณ์ในรูปต่อไปนี้" />
                        <br />
                        Naming: ให้ดูรูปแล้วถามว่าสิ่งนี้คืออะไร — <ImageRef label="แสดงรูป" src="language2.png" alt="สิ่งของในรูปมีอะไรบ้าง" />
                        <br />
                        Repetition: ให้ผู้ป่วยพูดตาม
                        <br />
                        หากใส่ท่อช่วยหายใจ ให้ผู้ป่วยเขียนตอบ
                    </>
                ),
                options: [
                    { value: "0", score: 0, label: "0 — สื่อสารภาษาได้ปกติ" },
                    { value: "1", score: 1, label: "1 — สื่อสารผิดพลาดเล็กน้อย แต่ยังพอเข้าใจ" },
                    { value: "2", score: 2, label: "2 — ผู้ทดสอบไม่เข้าใจว่าผู้ป่วยสื่อสารอะไร" },
                    { value: "3", score: 3, label: "3 — Global aphasia, coma" },
                ],
            },
            {
                id: "10",
                number: "10",
                title: "การออกเสียง",
                sub: "Dysarthria",
                note: <>ให้อ่านประโยค — <ImageRef label="แสดงประโยค" src="dysarthria.png" alt="อ่านประโยคต่อไปนี้" /></>,
                options: [
                    { value: "0", score: 0, label: "0 — ชัดเจนปกติ" },
                    { value: "1", score: 1, label: "1 — ออกเสียงเพี้ยนเล็กน้อย พอเข้าใจ" },
                    { value: "2", score: 2, label: "2 — พูดไม่ชัดอย่างมาก ผู้ฟังไม่เข้าใจ โดยไม่มีความผิดปกติของการเข้าใจภาษา" },
                    { value: "3", score: 3, label: "3 — พูดไม่ชัดมากจนฟังไม่ออกเลย หรือไม่สามารถพูดได้" },
                    { value: "UN", score: null, label: "UN — ตรวจไม่ได้เพราะใส่ท่อช่วยหายใจ หรือมีปัญหาทางกายในการเปล่งเสียง / ไม่เข้าใจภาษา", un: true },
                ],
            },
            {
                id: "11",
                number: "11",
                title: "Extinction / Inattention",
                sub: "การเพิกเฉยต่อสิ่งเร้า",
                note: (
                    <>
                        Auditory — ถูนิ้วข้างหู แล้วให้บอกว่าได้ยินข้างไหน
                        <br />
                        Visual — กระดิกนิ้วแล้วให้บอกว่านิ้วข้างไหนกระดิก
                        <br />
                        Tactile — สัมผัสผู้ป่วยแล้วให้บอกว่าสัมผัสข้างไหน
                        <br />
                        ทดสอบซ้าย–ขวา–ทั้งสองข้างพร้อมกัน (double stimulation)
                    </>
                ),
                options: [
                    { value: "0", score: 0, label: "0 — ปกติ" },
                    { value: "1", score: 1, label: "1 — เพิกเฉยขณะ double stimulation ใน 1 modality" },
                    { value: "2", score: 2, label: "2 — เพิกเฉยขณะ double stimulation ในมากกว่า 1 modality" },
                ],
            },
        ],
        []
    );
}
interface ItemProps {
    id: string;
    number: string;
    title: string;
    sub: string;
    note?: ReactNode;
    options: Option[];
};

type ItemRowProps = {
    item: ItemProps;
    isOpen: boolean;
    onToggle: () => void;
    value?: string;
    onSelect: (itemId: string, value: string) => void;
    rowRef: Ref<HTMLDivElement>;
};

function ItemRow({ item, isOpen, onToggle, value, onSelect, rowRef }: ItemRowProps) {
    const selectedOption = item.options.find((o) => o.value === value);

    return (
        <div
            ref={rowRef}
            className="rounded-xl overflow-hidden transition-shadow"
            style={{
                background: T.card,
                border: `1px solid ${isOpen ? T.teal : T.border}`,
                boxShadow: isOpen ? "0 2px 14px rgba(13,122,114,0.08)" : "none",
            }}
        >
            <div
                onClick={onToggle}
                className="w-full flex items-center gap-3 px-4 py-3 text-left focus-visible:outline focus-visible:outline-2"
                style={{ outlineColor: T.teal }}
                aria-expanded={isOpen}
            >
                <span
                    className="flex-none rounded-lg text-xs font-bold flex items-center justify-center"
                    style={{
                        width: 34,
                        height: 34,
                        fontVariantNumeric: "tabular-nums",
                        background: value != null ? T.tealSoft : T.paper,
                        color: value != null ? T.teal : T.muted,
                        border: `1px solid ${value != null ? T.teal : T.border}`,
                    }}
                >
                    {item.number}
                </span>

                <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold" style={{ color: T.ink }}>
                        {item.title}
                    </span>
                    <span className="block text-xs" style={{ color: T.muted }}>
                        {item.sub}
                    </span>
                </span>

                {!isOpen && selectedOption && (
                    <span
                        className="flex-none rounded-full px-2.5 py-1 text-xs font-bold"
                        style={{
                            background: selectedOption.un ? T.paper : T.tealSoft,
                            color: selectedOption.un ? T.muted : T.teal,
                            border: `1px solid ${selectedOption.un ? T.border : T.teal}`,
                        }}
                    >
                        {selectedOption.un ? "UN" : selectedOption.score}
                    </span>
                )}
                {!isOpen && !selectedOption && (
                    <span className="flex-none text-[11px] font-semibold" style={{ color: T.muted }}>
                        ยังไม่ประเมิน
                    </span>
                )}

                <ChevronDown
                    size={18}
                    style={{ color: T.muted, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                />
            </div>

            {isOpen && (
                <div className="px-4 pb-4">
                    <div className="h-px mb-3" style={{ background: T.border }} />
                    {item.note && <Note>{item.note}</Note>}

                    <div role="radiogroup" aria-label={item.title} className="flex flex-col gap-2">
                        {item.options.map((opt) => {
                            const checked = value === opt.value;
                            return (
                                <div
                                    key={opt.value}
                                    role="radio"
                                    aria-checked={checked}
                                    onClick={() => onSelect(item.id, opt.value)}
                                    className="flex items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm leading-snug transition-colors focus-visible:outline focus-visible:outline-2"
                                    style={{
                                        background: checked ? T.tealSoft : T.paper,
                                        border: `1px solid ${checked ? T.teal : T.border}`,
                                        color: T.ink,
                                        outlineColor: T.teal,
                                    }}
                                >
                                    <span
                                        className="flex-none mt-0.5 rounded-full flex items-center justify-center"
                                        style={{
                                            width: 18,
                                            height: 18,
                                            border: `2px solid ${checked ? T.teal : T.border}`,
                                            background: checked ? T.teal : "transparent",
                                        }}
                                    >
                                        {checked && <Check size={11} color="#fff" strokeWidth={3} />}
                                    </span>
                                    <span>{opt.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}



/* ----------------------------------------------------------------------
   Root
------------------------------------------------------------------------- */
export default function Stroke() {
    const items = useItems();
    const [scores, setScores] = useState<Record<string, string>>({});
    const [openId, setOpenId] = useState(items[0].id);
    const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const total = items.reduce((sum, item) => {
        const v = scores[item.id];
        if (v == null) return sum;
        const opt = item.options.find((o) => o.value === v);
        return sum + (opt && opt.score != null ? opt.score : 0);
    }, 0);
    const answered = items.filter((item) => scores[item.id] != null).length;
    const severity = severityFor({ total: total });

    function handleSelect(itemId: string, value: string) {
        setScores((s) => ({ ...s, [itemId]: value }));
        const idx = items.findIndex((i) => i.id === itemId);
        const next = items.slice(idx + 1).find((i) => scores[i.id] == null) || items[idx + 1];
        setTimeout(() => {
            if (next) {
                setOpenId(next.id);
                //rowRefs.current[next.id]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
            } else {
                setOpenId("");
            }
        }, 220);
    }

    function handleReset() {
        setScores({});
        setOpenId(items[0].id);
    }

    return (
        <div className="min-h-screen w-full flex justify-center" style={{ background: T.paper }}>
            <style>{`
        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; }
        }
      `}</style>
            <Tokens />
            <div className="w-full max-w-2xl px-4 pb-16 pt-6">
                {/* Page heading */}
                <button
                    onClick={() => window.location.href = '/'}
                    className="flex items-center gap-1 text-sm font-medium mb-4"
                    style={{ color: "#5C7080" }}
                >
                    <House size={16} /> Home
                </button>
                <div className="mb-4">
                    <Eyebrow tone="teal">Porames PocketMed</Eyebrow>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl font-extrabold" style={{ color: T.ink, letterSpacing: "-0.01em" }}>
                            Stroke Fast Track
                        </h1>
                        <span
                            className="text-[10px] font-bold uppercase rounded-md px-1.5 py-0.5"
                            style={{ background: T.redSoft, color: T.red, letterSpacing: "0.04em" }}
                        >
                            Beta
                        </span>
                    </div>
                    <p className="text-sm" style={{ color: T.muted }}>
                        NIHSS assessment for students
                    </p>
                </div>

                <div className="rounded-xl p-4 bg-white">
                    <h3 className="text-base font-semibold mb-2" style={{ color: T.ink }}>NIHSS assessment for students</h3>
                    <div
                        className="sticky top-3 z-40 rounded-2xl px-4 py-3.5 mb-5 flex items-center gap-4"
                        style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: "0 6px 24px rgba(28,36,32,0.07)" }}
                    >
                        <div
                            className="flex-none rounded-xl flex flex-col items-center justify-center"
                            style={{ width: 64, height: 64, background: severity.bg }}
                        >
                            <span className="text-2xl font-extrabold tabular-nums" style={{ color: severity.color }}>
                                {total}
                            </span>
                            <span className="text-[10px] font-bold" style={{ color: severity.color }}>
                                / 42
                            </span>
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate mb-3" style={{ color: severity.color }}>
                                {severity.label}
                            </p>
                            <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: T.paper }}>
                                <div
                                    className="h-full rounded-full transition-all"
                                    style={{ width: `${(answered / items.length) * 100}%`, background: T.teal }}
                                />
                            </div>
                            <p className="text-[11px] mt-1 font-medium" style={{ color: T.muted }}>
                                ประเมินแล้ว {answered} / {items.length} ข้อ
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleReset}
                            aria-label="เริ่มประเมินใหม่"
                            className="flex-none rounded-lg p-2 focus-visible:outline focus-visible:outline-2"
                            style={{ color: T.muted, border: `1px solid ${T.border}`, outlineColor: T.teal }}
                        >
                            <RotateCcw size={16} />
                        </button>
                    </div>

                    {/* Items */}
                    <div className="flex flex-col gap-2.5">
                        {items.map((item) => (
                            <ItemRow
                                key={item.id}
                                item={item}
                                isOpen={openId === item.id}
                                onToggle={() => setOpenId(openId === item.id ? "" : item.id)}
                                value={scores[item.id]}
                                onSelect={handleSelect}
                                rowRef={(el) => {
                                    rowRefs.current[item.id] = el;
                                }}
                            />
                        ))}
                    </div>

                </div>
                <ManagementSection nihssScore={Number(total)} />
            </div>
        </div>
    );
}