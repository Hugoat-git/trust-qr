'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import type { Participant } from '@/types';

interface ExportCSVButtonProps {
  participants: Participant[];
  restaurantName: string;
}

export function ExportCSVButton({ participants, restaurantName }: ExportCSVButtonProps) {
  function handleExport() {
    if (participants.length === 0) return;

    const headers = [
      'Prénom',
      'Email',
      'Téléphone',
      'Gain',
      'Code Voucher',
      'Voucher Utilisé',
      'Voucher Expiré',
      'Avis Google',
      'Date',
    ];

    const rows = participants.map((p) => {
      const isExpired = new Date(p.voucher_expires_at) < new Date();
      const voucherStatus = p.voucher_used ? 'Oui' : isExpired ? 'Expiré' : 'Non';
      const reviewStatus =
        p.review_status === 'verified'
          ? 'Vérifié'
          : p.review_status === 'pending'
            ? 'En attente'
            : p.review_status === 'expired'
              ? 'Expiré'
              : p.review_clicked_at
                ? 'Cliqué'
                : '-';

      return [
        p.first_name,
        p.email,
        p.phone || '',
        p.prize_label,
        p.voucher_code,
        voucherStatus,
        isExpired ? 'Oui' : 'Non',
        reviewStatus,
        new Date(p.created_at).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      ];
    });

    const escape = (val: string) => {
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    const csv =
      '\uFEFF' +
      [headers.map(escape).join(','), ...rows.map((row) => row.map(escape).join(','))].join(
        '\n',
      );

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `participants-${restaurantName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={participants.length === 0}
    >
      <Download className="w-4 h-4 mr-2" />
      Exporter CSV
    </Button>
  );
}
