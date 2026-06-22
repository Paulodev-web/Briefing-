import Image from "next/image"

export default function ObrigadoPage() {
  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-8">
          <Image
            src="/devpaulo.png"
            alt="devpaulo.com.br"
            width={120}
            height={36}
            style={{ height: "36px", width: "auto" }}
          />
        </div>
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold">Briefing enviado!</h1>
        <p className="text-muted-foreground mt-2">
          Obrigado pelo preenchimento. Entraremos em contato em breve.
        </p>
      </div>
    </div>
  )
}
