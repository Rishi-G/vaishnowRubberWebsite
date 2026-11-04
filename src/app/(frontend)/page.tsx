import { HomeView } from '@/components/site/Views'
import { getPage } from '@/lib/cms'

export default async function Page() {
  return <HomeView content={await getPage('home')} />
}
