import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import {
  lookupReservations,
  type ReservationLookupItem,
} from "@/lib/reservations.functions";

import heroImg from "@/assets/hero.jpg";
import catLatte from "@/assets/cat-latte.jpg";
import catPudding from "@/assets/cat-pudding.jpg";
import catMochi from "@/assets/cat-mochi.jpg";
import menuImg from "@/assets/menu.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "貓癒所 Cat Healing House｜台北貓咪咖啡廳" },
      {
        name: "description",
        content:
          "貓癒所是台北的貓咪咖啡廳，提供手沖咖啡、甜點與貓咪互動空間。線上預約時段，來一場被貓咪療癒的午後。",
      },
      { property: "og:title", content: "貓癒所｜台北貓咪咖啡廳" },
      {
        property: "og:description",
        content: "溫暖木質空間、可愛貓咪店員與好喝咖啡，歡迎預約來貓癒所放鬆一下。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const cats = [
  {
    name: "拿鐵",
    img: catLatte,
    tag: "撒嬌大王",
    desc: "店裡的撒嬌大王，最喜歡被摸下巴。只要你坐下，牠十秒內就會出現在你腿邊。",
  },
  {
    name: "布丁",
    img: catPudding,
    tag: "好奇探險家",
    desc: "好奇心旺盛的探險家，總在追逐雷射筆。全店最會跑酷的小小身影。",
  },
  {
    name: "麻糬",
    img: catMochi,
    tag: "慵懶睡神",
    desc: "全店最會睡的麻糬，最愛窩在陽光灑進來的窗邊軟墊上。走路慢慢的，但只要聽到零食袋聲音就會秒醒。",
  },
];


const menu = [
  { group: "咖啡", items: [["手沖單品咖啡", "180"], ["貓爪拿鐵", "160"], ["黑糖燕麥拿鐵", "170"]] },
  { group: "茶飲", items: [["蜜香紅茶", "140"], ["伯爵鮮奶茶", "150"], ["季節花草茶", "150"]] },
  { group: "點心", items: [["肉桂捲", "120"], ["巴斯克乳酪蛋糕", "150"], ["貓掌棉花糖餅乾", "90"]] },
];

const rules = [
  "入場低消一杯飲品，另收清潔費 NT$100／人。",
  "每時段兩小時，超時每 30 分鐘加收 NT$50。",
  "入場請先洗手消毒，並將包包放入置物櫃。",
  "請勿餵食自帶食物，貓咪點心可於櫃檯購買。",
];

const faqs = [
  {
    q: "可以抱貓咪嗎？",
    a: "請不要主動抱起貓咪。牠們願意時自然會靠近你，蹲低身體、伸出手讓牠聞聞是最好的打招呼方式。",
  },
  {
    q: "貓咪在睡覺可以摸嗎？",
    a: "睡覺與用餐中的貓咪請讓牠們安靜休息，這是貓咪一天中最重要的充電時間。",
  },
  { q: "可以帶小朋友來嗎？", a: "歡迎 7 歲以上兒童，需由家長全程陪同並協助注意互動安全。" },
  { q: "需要預約嗎？", a: "強烈建議預約。假日時段常常客滿，線上預約可保留您的座位。" },
];

const timeSlots = ["11:00 - 13:00", "13:30 - 15:30", "16:00 - 18:00", "18:30 - 20:30"];

const emptyForm = {
  name: "",
  phone: "",
  visitDate: "",
  timeSlot: "",
  partySize: "2",
  note: "",
};

function Index() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const today = new Date().toISOString().slice(0, 10);

  const setField = (key: keyof typeof emptyForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const size = Number(form.partySize);
    if (!Number.isInteger(size) || size < 1 || size > 8) {
      toast.error("人數請填 1 至 8 人。");
      return;
    }
    if (form.visitDate < today) {
      toast.error("來店日期不能早於今天。");
      return;
    }

    setSubmitting(true);
    setSent(false);
    const { error } = await supabase.from("reservations").insert({
      name: form.name.trim(),
      phone: form.phone.trim(),
      visit_date: form.visitDate,
      time_slot: form.timeSlot,
      party_size: size,
      note: form.note.trim() || null,
    });
    setSubmitting(false);

    if (error) {
      console.error(error);
      toast.error("預約送出失敗，請稍後再試或來電預約。");
      return;
    }

    setForm(emptyForm);
    setSent(true);
    toast.success("預約已送出，我們會盡快與您聯繫！");
  };


  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a href="#top" className="font-display text-xl font-bold text-primary">
            貓癒所
          </a>
          <div className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#about" className="transition-colors hover:text-primary">關於我們</a>
            <a href="#cats" className="transition-colors hover:text-primary">貓咪成員</a>
            <a href="#menu" className="transition-colors hover:text-primary">菜單</a>
            <a href="#rules" className="transition-colors hover:text-primary">消費方式</a>
            <a href="#faq" className="transition-colors hover:text-primary">訪客須知</a>
          </div>
          <a href="#booking" className="btn-warm btn-warm-hover px-5 py-2 text-sm">
            線上預約
          </a>
        </nav>
      </header>

      <main id="top">
        <section className="relative">
          <img
            src={heroImg}
            alt="貓癒所溫暖木質空間中，一隻橘貓慵懶趴在木架上"
            width={1600}
            height={1008}
            className="h-[68vh] min-h-100 w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-wood/85 via-wood/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-5 pb-14">
            <p className="text-sm tracking-[0.4em] text-cream/90">TAIPEI CAT CAFE</p>
            <h1 className="mt-4 max-w-3xl font-display text-3xl leading-snug font-bold text-cream md:text-5xl md:leading-tight">
              歡迎來到「貓癒所」，
              <br />
              一個讓你被貓咪療癒的溫暖角落。
            </h1>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#booking" className="btn-warm btn-warm-hover">
                預約來店時段
              </a>
              <a
                href="#cats"
                className="inline-flex items-center rounded-full border border-cream/60 px-7 py-3 font-semibold text-cream transition-colors hover:bg-cream/15"
              >
                認識貓咪店員
              </a>
            </div>
          </div>
        </section>

        <section id="about" className="mx-auto max-w-4xl px-5 py-20 text-center">
          <p className="text-sm tracking-[0.3em] text-accent-foreground/70">ABOUT US</p>
          <h2 className="mt-3 text-2xl font-bold md:text-3xl">關於我們</h2>
          <p className="mt-6 text-base leading-loose text-muted-foreground md:text-lg">
            「貓癒所」不僅是一家咖啡廳，更是人與貓咪建立深刻連結的橋樑。
            <br className="hidden md:block" />
            我們致力於提供一個舒適、乾淨的環境，讓每一位客人都能在這裡找到片刻的寧靜與快樂。
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ["🐾", "貓咪優先", "所有規則都以貓咪的舒適為出發點"],
              ["☕", "職人咖啡", "每日新鮮烘焙，單品手沖現點現做"],
              ["🧼", "乾淨安心", "每日三次全區清潔與空氣循環"],
            ].map(([icon, title, desc]) => (
              <div key={title} className="surface-card px-6 py-7">
                <div className="text-2xl">{icon}</div>
                <h3 className="mt-3 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="cats" className="warm-panel py-20">
          <div className="mx-auto max-w-6xl px-5">
            <div className="text-center">
              <p className="text-sm tracking-[0.3em] text-accent-foreground/70">OUR CATS</p>
              <h2 className="mt-3 text-2xl font-bold md:text-3xl">貓咪成員</h2>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {cats.map((cat) => (
                <article key={cat.name} className="surface-card overflow-hidden">
                  <img
                    src={cat.img}
                    alt={`貓咪店員 ${cat.name}`}
                    loading="lazy"
                    width={900}
                    height={900}
                    className="h-72 w-full object-cover"
                  />
                  <div className="px-7 py-6">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold">{cat.name}</h3>
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                        {cat.tag}
                      </span>
                    </div>
                    <p className="mt-3 leading-relaxed text-muted-foreground">{cat.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="menu" className="mx-auto max-w-6xl px-5 py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
            <img
              src={menuImg}
              alt="木桌上的拿鐵咖啡與乳酪蛋糕"
              loading="lazy"
              width={1200}
              height={800}
              className="w-full rounded-3xl object-cover shadow-[var(--shadow-soft)]"
            />
            <div>
              <p className="text-sm tracking-[0.3em] text-accent-foreground/70">MENU</p>
              <h2 className="mt-3 text-2xl font-bold md:text-3xl">餐點菜單</h2>
              <div className="mt-8 space-y-8">
                {menu.map((section) => (
                  <div key={section.group}>
                    <h3 className="text-lg font-bold text-primary">{section.group}</h3>
                    <ul className="mt-3 space-y-3">
                      {section.items.map(([name, price]) => (
                        <li
                          key={name}
                          className="flex items-baseline gap-3 border-b border-dashed border-border pb-2"
                        >
                          <span>{name}</span>
                          <span className="grow" />
                          <span className="font-semibold text-muted-foreground">NT$ {price}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="rules" className="warm-panel py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-2">
            <div>
              <p className="text-sm tracking-[0.3em] text-accent-foreground/70">PRICING</p>
              <h2 className="mt-3 text-2xl font-bold md:text-3xl">消費方式</h2>
              <ul className="mt-8 space-y-4">
                {rules.map((r) => (
                  <li key={r} className="surface-card flex gap-3 px-6 py-4 leading-relaxed">
                    <span className="text-paw">🐾</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div id="faq">
              <p className="text-sm tracking-[0.3em] text-accent-foreground/70">Q &amp; A</p>
              <h2 className="mt-3 text-2xl font-bold md:text-3xl">訪客須知</h2>
              <div className="mt-8 space-y-4">
                {faqs.map((f) => (
                  <details key={f.q} className="surface-card group px-6 py-4">
                    <summary className="cursor-pointer list-none font-semibold marker:hidden">
                      <span className="text-primary">Q.</span> {f.q}
                    </summary>
                    <p className="mt-3 leading-relaxed text-muted-foreground">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="booking" className="mx-auto max-w-3xl px-5 py-20">
          <div className="text-center">
            <p className="text-sm tracking-[0.3em] text-accent-foreground/70">RESERVATION</p>
            <h2 className="mt-3 text-2xl font-bold md:text-3xl">線上預約</h2>
            <p className="mt-4 text-muted-foreground">
              選擇您想來店的日期與時段，我們會以電話或簡訊與您確認。
            </p>
          </div>

          <form
            className="surface-card mt-10 grid gap-5 px-7 py-8 sm:grid-cols-2"
            onSubmit={handleSubmit}
          >
            <Field label="姓名">
              <input
                required
                maxLength={50}
                className={inputCls}
                placeholder="王小貓"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
              />
            </Field>
            <Field label="聯絡電話">
              <input
                required
                type="tel"
                pattern="[0-9+\-()\s]{6,30}"
                title="請輸入有效的電話號碼"
                className={inputCls}
                placeholder="0912-345-678"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
              />
            </Field>
            <Field label="來店日期">
              <input
                required
                type="date"
                min={today}
                className={inputCls}
                value={form.visitDate}
                onChange={(e) => setField("visitDate", e.target.value)}
              />
            </Field>
            <Field label="時段">
              <select
                required
                className={inputCls}
                value={form.timeSlot}
                onChange={(e) => setField("timeSlot", e.target.value)}
              >
                <option value="" disabled>
                  請選擇
                </option>
                {timeSlots.map((slot) => (
                  <option key={slot}>{slot}</option>
                ))}
              </select>
            </Field>
            <Field label="人數">
              <input
                required
                type="number"
                min={1}
                max={8}
                className={inputCls}
                value={form.partySize}
                onChange={(e) => setField("partySize", e.target.value)}
              />
            </Field>
            <Field label="備註（選填）">
              <input
                className={inputCls}
                maxLength={300}
                placeholder="想坐窗邊、慶生⋯⋯"
                value={form.note}
                onChange={(e) => setField("note", e.target.value)}
              />
            </Field>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn-warm btn-warm-hover w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "送出中⋯⋯" : "送出預約"}
              </button>
              {sent && (
                <p className="mt-4 rounded-2xl bg-secondary px-4 py-3 text-center text-sm text-secondary-foreground">
                  預約已送出！我們會在營業時間內與您聯繫確認，貓咪們期待見到你 🐈
                </p>
              )}
            </div>
          </form>

        </section>
      </main>

      <footer className="bg-wood py-14 text-cream">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:grid-cols-3">
          <div>
            <h2 className="font-display text-xl font-bold">貓癒所</h2>
            <p className="mt-3 text-sm text-cream/75">被貓咪療癒的溫暖角落。</p>
          </div>
          <div className="text-sm leading-loose text-cream/85">
            <p>地址：台北市 XX 區 XX 路 XX 號</p>
            <p>
              電話：<a href="tel:0212345678" className="underline-offset-4 hover:underline">02-1234-5678</a>
            </p>
          </div>
          <div className="text-sm leading-loose text-cream/85">
            <p>營業時間</p>
            <p>週二至週日 11:00 - 21:00</p>
            <p>週一公休</p>
          </div>
        </div>
        <p className="mt-10 text-center text-xs text-cream/60">
          © 2026 貓癒所 Cat Healing House
        </p>
      </footer>
    </div>
  );
}

const inputCls =
  "mt-2 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      {children}
    </label>
  );
}
