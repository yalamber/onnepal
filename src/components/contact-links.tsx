import { Phone, MessageCircle } from 'lucide-react';

interface ContactLinksProps {
  phone?: string | null;
  whatsapp?: string | null;
}

export function ContactLinks({ phone, whatsapp }: ContactLinksProps) {
  if (!phone && !whatsapp) return null;

  const whatsappNumber = whatsapp?.replace(/\D/g, '');

  return (
    <div className="flex items-center gap-2">
      {phone && (
        <a
          href={`tel:${phone}`}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-950"
        >
          <Phone className="h-4 w-4" />
          {phone}
        </a>
      )}
      {whatsappNumber && (
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-950"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
      )}
    </div>
  );
}
