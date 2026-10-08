import { FaFacebook, FaStore, FaTiktok, FaWhatsapp, FaLock } from 'react-icons/fa'
import {
  FACEBOOK_URL,
  MARKETPLACE_URL,
  STORE_NAME,
  TIKTOK_URL,
  WHATSAPP_NUMBER,
} from '../config'
import Logo from './Logo'
import { Link } from 'react-router-dom'

const links = [
  {
    label: 'WhatsApp',
    href: WHATSAPP_NUMBER && `https://wa.me/${WHATSAPP_NUMBER}`,
    Icon: FaWhatsapp,
  },
  { label: 'TikTok', href: TIKTOK_URL, Icon: FaTiktok },
  { label: 'Facebook', href: FACEBOOK_URL, Icon: FaFacebook },
  { label: 'Marketplace', href: MARKETPLACE_URL, Icon: FaStore },
].filter((link) => link.href)

export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row">
        <Logo className="h-15" />
        <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} {STORE_NAME}. Todos los derechos reservados.
        </p>

        {links.length > 0 && (
          <div className="flex gap-4">
            {links.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                title={label}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-gray-500 transition hover:text-pink-600"
              >   
                <Icon className="h-6 w-6" />
              </a>
            ))}
          </div>
        )}
      </div>
      
    </footer>
  )
}