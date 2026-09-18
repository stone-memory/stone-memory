import { HomeAboutClient } from "@/components/home-about-client"
import { fetchBusinessProfile } from "@/lib/data-source"
import { telHref } from "@/lib/business-profile"

/**
 * Як працюємо — три кроки, спільні для обох напрямів, і фінальний CTA.
 * Без цін і каталогів: це рівень «як із нами працювати», а не «що купити».
 * Блок «хто ми» з чотирма тезами прибрано: усе це є на /pro-nas.
 *
 * Профіль бізнесу читається на сервері (єдине джерело контактів — база),
 * а тексти обирає за мовою клієнтський HomeAboutClient.
 */
export async function HomeAbout() {
  const profile = await fetchBusinessProfile()
  return <HomeAboutClient phone={profile.phone} telHref={telHref(profile)} />
}
