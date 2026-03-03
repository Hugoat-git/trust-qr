import { supabaseAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Mail, Phone, AlertCircle } from 'lucide-react';
import { QRLoader } from '@/components/ui/qr-loader';
import type { Participant } from '@/types';
import { ExportCSVButton } from '@/components/admin/export-csv-button';
import { InfoTooltip } from '@/components/admin/info-tooltip';

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface RestaurantData {
  id: string;
  name: string;
}

async function getParticipants(slug: string) {
  // Récupérer le restaurant
  const { data, error } = await supabaseAdmin
    .from('restaurants')
    .select('id, name')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return null;
  }

  const restaurant = data as RestaurantData;

  // Récupérer les participants
  const { data: participantsData } = await supabaseAdmin
    .from('participants')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .order('created_at', { ascending: false });

  const participants = (participantsData || []) as Participant[];

  return { restaurant, participants };
}

export default async function ParticipantsPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getParticipants(slug);

  if (!data) {
    notFound();
  }

  const { restaurant, participants } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">Participants</h1>
            <InfoTooltip
              title="Liste des participants"
              description="Tous les clients ayant participé via votre QR code. Vous pouvez exporter la liste en CSV pour l'utiliser dans votre CRM."
              tips={[
                "Cliquez sur 'Exporter CSV' pour télécharger la liste",
                "Les statuts voucher et avis Google sont mis à jour automatiquement",
              ]}
            />
          </div>
          <p className="text-muted-foreground mt-1">
            {participants.length} participant{participants.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <ExportCSVButton participants={participants} restaurantName={restaurant.name} />
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] admin-table">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left">
                    Participant
                  </th>
                  <th className="px-6 py-3 text-left">
                    Gain
                  </th>
                  <th className="px-6 py-3 text-left">
                    Code voucher
                  </th>
                  <th className="px-6 py-3 text-left">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left">
                    Avis Google
                  </th>
                  <th className="px-6 py-3 text-left">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {participants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      Aucun participant pour le moment
                    </td>
                  </tr>
                ) : (
                  participants.map((participant) => {
                    const isExpired = new Date(participant.voucher_expires_at) < new Date();

                    return (
                      <tr key={participant.id} className="hover:bg-accent transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">
                              {participant.first_name}
                            </span>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              {participant.email}
                            </div>
                            {participant.phone && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                {participant.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-primary">
                            {participant.prize_label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                            {participant.voucher_code}
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          {participant.voucher_used ? (
                            <Badge className="bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400 hover:bg-green-100">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Utilisé
                            </Badge>
                          ) : isExpired ? (
                            <Badge className="bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 hover:bg-red-100">
                              <XCircle className="w-3 h-3 mr-1" />
                              Expiré
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100">
                              <Clock className="w-3 h-3 mr-1" />
                              En attente
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {participant.review_status === 'verified' ? (
                            <Badge className="bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400 hover:bg-green-100">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Vérifié
                            </Badge>
                          ) : participant.review_status === 'pending' ? (
                            <Badge className="bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-100">
                              <QRLoader size={12} className="mr-1" />
                              En attente
                            </Badge>
                          ) : participant.review_status === 'expired' ? (
                            <Badge className="bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 hover:bg-red-100">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Expiré
                            </Badge>
                          ) : participant.review_clicked_at ? (
                            <Badge className="bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 hover:bg-blue-100">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Cliqué
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(participant.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
