'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { QRResolverView } from '../../../components/QRResolverView';

export default function DynamicResolverPage({
  params,
}: {
  params: Promise<{ codeId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <QRResolverView
        codeId={resolvedParams.codeId}
        onClose={() => router.push('/')}
      />
    </div>
  );
}

