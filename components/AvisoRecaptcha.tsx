import { recaptchaActivo } from '@/lib/recaptcha-cliente'
import { textos, type Idioma } from '@/lib/idioma'

/**
 * La atribución que Google exige a cambio de esconder el sello de reCAPTCHA.
 *
 * El sello se esconde (`.grecaptcha-badge` en `globals.css`) porque se coloca
 * solo abajo a la derecha, justo donde está el flotante de WhatsApp, y lo tapa
 * a medias sin dar ningún error. Google lo permite SI cada formulario protegido
 * lleva este texto con los dos enlaces. Por eso vive en un componente: al
 * copiar un formulario a otra página, el aviso viaja con él.
 *
 * Sin clave de reCAPTCHA no se pinta: prometer una protección que no está
 * puesta es mentir en letra pequeña.
 */
export default function AvisoRecaptcha({ idioma, className = '' }: { idioma: Idioma; className?: string }) {
  if (!recaptchaActivo) return null
  const t = textos(idioma)
  return (
    <p className={`text-[0.75rem] leading-relaxed opacity-55 ${className}`}>
      {t.recaptchaAntes}
      <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="underline underline-offset-2">
        {t.recaptchaPrivacidad}
      </a>
      {t.recaptchaY}
      <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="underline underline-offset-2">
        {t.recaptchaCondiciones}
      </a>
      {t.recaptchaDespues}
    </p>
  )
}
