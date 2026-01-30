import { supabaseAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Mail, Phone } from 'lucide-react';
import type { Participant } from '@/types';

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Participants</h1>
        <p className="text-gray-500 mt-1">
          {participants.length} participant{participants.length > 1 ? 's' : ''} au total
        </p>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code voucher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avis Google
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {participants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Aucun participant pour le moment
                    </td>
                  </tr>
                ) : (
                  participants.map((participant) => {
                    const isExpired = new Date(participant.voucher_expires_at) < new Date();

                    return (
                      <tr key={participant.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">
                              {participant.first_name}
                            </span>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Mail className="w-3 h-3" />
                              {participant.email}
                            </div>
                            {participant.phone && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
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
                          <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                            {participant.voucher_code}
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          {participant.voucher_used ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Utilisé
                            </Badge>
                          ) : isExpired ? (
                            <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                              <XCircle className="w-3 h-3 mr-1" />
                              Expiré
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                              <Clock className="w-3 h-3 mr-1" />
                              En attente
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {participant.review_clicked_at ? (
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Cliqué
                            </Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
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
