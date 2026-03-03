import { QRLoader } from '@/components/ui/qr-loader';

export default function ParticipantsLoading() {
  return (
    <div className="flex items-center justify-center py-32">
      <QRLoader size={48} />
    </div>
  );
}
