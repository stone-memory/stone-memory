import { getContacts, getProjects } from '@/lib/stone/cms'
import { InquiryForm } from '@/components/stone/interactive/tools'
import { PageHero } from '@/components/stone/pages/primitives'

export async function ContactPage() {
  const [contacts, projects] = await Promise.all([getContacts(), getProjects()])
  return (
    <PageHero
      eyebrow="Контакти"
      title="Поговорімо про ваш простір."
      copy="Залиште короткий запит або скористайтеся контактами нижче."
    >
      <div className="grid gap-8 lg:grid-cols-[.7fr_1fr]">
        <div className="rounded-xl bg-primary p-8 text-primary-foreground">
          <p className="eyebrow opacity-50">Stone Memory</p>
          <p className="mt-12 text-3xl font-semibold">
            {contacts.address.city}, {contacts.address.country}
          </p>
          <p className="mt-3 text-sm opacity-60">
            {contacts.address.street}
            <br />
            {contacts.phone.display}
            <br />
            {contacts.email.display}
            <br />
            {contacts.hours.weekdays}
          </p>
        </div>
        <InquiryForm proposals={projects} />
      </div>
    </PageHero>
  )
}
