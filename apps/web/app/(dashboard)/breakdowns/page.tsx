import { redirect } from 'next/navigation';

export default function BreakdownsPage() {
    redirect('/maintenance?tab=breakdowns');
}
