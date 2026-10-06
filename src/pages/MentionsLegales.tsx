import React from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const GREEN = "#1f6b2d";
const DARK_GREEN = "#164f22";
const CREAM = "#f7f0e4";

const MentionsLegales = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: CREAM }}>
      <Header />

      <main className="flex-1 pt-[110px] pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1
            className="font-playfair text-4xl mb-8"
            style={{ color: DARK_GREEN }}
          >
            Mentions légales
          </h1>

          <div className="space-y-8 text-sm leading-7 text-neutral-700">
            {/* ─────────────── ÉDITEUR DU SITE ─────────────── */}
            <section>
              <h2
                className="font-playfair text-2xl mb-3"
                style={{ color: GREEN }}
              >
                Éditeur du site
              </h2>
              <p>
                Le site internet <strong>misschawarma.fr</strong>, ci-après
                dénommé « le Site », est édité par :
              </p>
              <ul className="mt-3 space-y-1">
                <li>
                  <strong>Raison sociale :</strong> MAISON MEZZÉ
                </li>
                <li>
                  <strong>Forme juridique :</strong> Société par actions
                  simplifiée unipersonnelle (SASU)
                </li>
                <li>
                  <strong>Capital social :</strong> 1 000 €
                </li>
                <li>
                  <strong>Siège social :</strong> 78 avenue des Champs-Élysées,
                  75008 Paris
                </li>
                <li>
                  <strong>Établissement exploité :</strong> 128 rue Oberkampf,
                  75011 Paris
                </li>
                <li>
                  <strong>Numéro SIREN :</strong> 100 753 755
                </li>
                <li>
                  <strong>Numéro SIRET (établissement) :</strong> 100 753 755
                  00014
                </li>
                <li>
                  <strong>RCS :</strong> Paris, n° 100 753 755
                </li>
                <li></li>
                <li>
                  <strong>Président :</strong> TALINTS SAS, 9 avenue Jenny,
                  92000 Nanterre (RCS Nanterre 982 588 873)
                </li>
                <li>
                  <strong>Directeur de la publication :</strong> Ali Alaeldine,
                  en qualité de représentant légal de TALINTS SAS, présidente de
                  MAISON MEZZÉ
                </li>
                <li>
                  <strong>Contact :</strong> misschawarma@gmail.com
                  {" · "}+33 1 42 52 60 48
                </li>
              </ul>
            </section>

            {/* ─────────────── HÉBERGEMENT ─────────────── */}
            <section>
              <h2
                className="font-playfair text-2xl mb-3"
                style={{ color: GREEN }}
              >
                Hébergement
              </h2>
              <p>Le Site est hébergé par :</p>
              <ul className="mt-3 space-y-1">
                <li>
                  <strong>Frontend :</strong> [raison sociale exacte trouvée sur
                  amen.fr/mentions-legales], [adresse exacte], France
                </li>
                <li>
                  <strong>Backend / API :</strong> Render Services, Inc., 525
                  Brannan Street, Suite 300, San Francisco, CA 94107, États-Unis
                </li>
              </ul>
            </section>

            {/* ─────────────── CONDITIONS D'UTILISATION ─────────────── */}
            <section>
              <h2
                className="font-playfair text-2xl mb-3"
                style={{ color: GREEN }}
              >
                Conditions d'utilisation
              </h2>
              <p>
                L'utilisateur du Site reconnaît disposer de la compétence et des
                moyens nécessaires pour y accéder et l'utiliser. L'éditeur du
                Site met tout en œuvre pour offrir aux utilisateurs des
                informations fiables, mais ne saurait être tenu responsable des
                erreurs, omissions, ou de l'indisponibilité temporaire du
                service, notamment en cas de force majeure ou de maintenance
                technique.
              </p>
            </section>

            {/* ─────────────── DONNÉES PERSONNELLES / RGPD ─────────────── */}
            <section>
              <h2
                className="font-playfair text-2xl mb-3"
                style={{ color: GREEN }}
              >
                Données personnelles
              </h2>
              <p>
                Dans le cadre de l'utilisation du Site (réservation de table,
                commande en ligne, demande d'événement, formulaire de contact),
                l'utilisateur est amené à communiquer des données à caractère
                personnel (nom, prénom, email, numéro de téléphone). Ces données
                sont collectées et traitées par MAISON MEZZÉ, responsable du
                traitement, aux fins suivantes :
              </p>
              <ul className="mt-3 list-disc pl-5 space-y-1">
                <li>Gestion des réservations de table et d'événements ;</li>
                <li>Gestion des commandes en ligne ;</li>
                <li>Réponse aux demandes de contact ;</li>
                <li>Amélioration de l'expérience utilisateur sur le Site.</li>
              </ul>
              <p className="mt-3">
                Conformément au Règlement Général sur la Protection des Données
                (RGPD) et à la loi Informatique et Libertés du 6 janvier 1978
                modifiée, l'utilisateur dispose d'un droit d'accès, de
                rectification, de suppression et d'opposition concernant ses
                données personnelles. Ces droits peuvent être exercés en
                écrivant à : misschawarma@gmail.com.
              </p>
              <p className="mt-3">
                Les données sont conservées pendant une durée de 3 ans à compter
                du dernier contact avec le client (réservation, commande ou
                message), sauf obligation légale de conservation plus longue
                (notamment les données liées à la facturation, conservées 10 ans
                conformément aux obligations comptables).
              </p>
            </section>

            {/* ─────────────── COOKIES ─────────────── */}
            <section>
              <h2
                className="font-playfair text-2xl mb-3"
                style={{ color: GREEN }}
              >
                Cookies
              </h2>
              <p>
                Lors de sa navigation sur le Site, l'utilisateur est informé
                qu'un bandeau de consentement lui permet d'accepter ou de
                refuser le dépôt de cookies non essentiels. Le Site utilise les
                cookies suivants :
              </p>
              <ul className="mt-3 list-disc pl-5 space-y-1">
                <li>
                  <strong>Google Analytics</strong> : mesure d'audience et de
                  fréquentation du Site (soumis à consentement) ;
                </li>
                <li>
                  <strong>Google Ads</strong> : suivi des campagnes
                  publicitaires (soumis à consentement) ;
                </li>
                <li>
                  <strong>Cookies techniques</strong> : nécessaires au bon
                  fonctionnement du Site (panier, préférences de langue),
                  exemptés de consentement.
                </li>
              </ul>
              <p className="mt-3">
                L'utilisateur peut à tout moment modifier ses préférences via le
                bandeau de gestion des cookies, ou en configurant son navigateur
                pour refuser leur dépôt.
              </p>
            </section>

            {/* ─────────────── PROPRIÉTÉ INTELLECTUELLE ─────────────── */}
            <section>
              <h2
                className="font-playfair text-2xl mb-3"
                style={{ color: GREEN }}
              >
                Propriété intellectuelle
              </h2>
              <p>
                L'ensemble des éléments composant le Site (textes, images,
                logos, structure, charte graphique) est la propriété exclusive
                de MAISON MEZZÉ, sauf mention contraire. Toute reproduction,
                totale ou partielle, sans autorisation préalable est interdite
                et constitutive de contrefaçon au sens des articles L. 335-2 et
                suivants du Code de la propriété intellectuelle.
              </p>
            </section>

            {/* ─────────────── DROIT APPLICABLE ─────────────── */}
            <section>
              <h2
                className="font-playfair text-2xl mb-3"
                style={{ color: GREEN }}
              >
                Droit applicable
              </h2>
              <p>
                Le présent Site et les présentes mentions légales sont soumis au
                droit français. En cas de litige, et à défaut de résolution
                amiable, les tribunaux français seront seuls compétents.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MentionsLegales;
