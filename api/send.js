export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "허용되지 않은 요청입니다." });
    return;
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { name, phone, email, score, total, percent } = body || {};

  if (!name || !phone || !email) {
    res.status(400).json({ error: "필수 항목이 누락됐어요." });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "서버 설정이 아직 완료되지 않았어요." });
    return;
  }

  const toEmail = process.env.TO_EMAIL || "seungju031220@naver.com";
  const fromEmail = process.env.FROM_EMAIL || "Quiz <onboarding@resend.dev>";

  const messageLines = [
    "일본어 단어 퀴즈 연락처 제출",
    "",
    `이름: ${name}`,
    `전화번호: ${phone}`,
    `이메일: ${email}`,
    "",
    `점수: ${score} / ${total} (${percent}%)`,
    "",
    "오늘도 공부 화이팅이에요!"
  ];

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject: "일본어 단어 퀴즈 연락처",
        text: messageLines.join("\n"),
        reply_to: email
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      res.status(500).json({ error: "메일 전송에 실패했어요.", detail: errorText });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "메일 전송 중 오류가 발생했어요." });
  }
}
