const { format } = require("date-fns");
const { fr } = require("date-fns/locale");

import {
    GenericOrderKeysToPersonKeys,
    GenericOrderKeysToOrgKeys,
    Org,
    Person,
    SerializedPerson,
} from "@domain/entities/Contact";
import { ILoggerService } from "@interfaces/ILoggerService";
import { IOrgRepository } from "@interfaces/persistence/IOrgRepository";
import { IPersonRepository } from "@interfaces/persistence/IPersonRepository";
import * as commonUtils from "@domain/commonUtils";
import { OrderStatus } from "@domain/entities/Order";

export class ContactService {
    PersonRepository: IPersonRepository;
    OrgRepository: IOrgRepository;
    LoggerService: ILoggerService;

    constructor(
        PersonRepository: IPersonRepository,
        OrgRepository: IOrgRepository,
        LoggerService: ILoggerService
    ) {
        this.PersonRepository = PersonRepository;
        this.OrgRepository = OrgRepository;
        this.LoggerService = LoggerService;
    }

    transformOrderKeysToPersonKeys(params: Record<string, any>) {
        return Object.keys(params.person).reduce((acc, key) => {
            const matchingKey = GenericOrderKeysToOrgKeys[key];

            if (matchingKey) {
                acc[matchingKey] = params.person[key];
            } else {
                acc[key] = params.person[key];
            }
            return acc;
        }, {});
    }

    transformOrderKeysToOrgKeys(params: Record<string, any>) {
        return Object.keys(params.org).reduce((acc, key) => {
            const matchingKey = GenericOrderKeysToPersonKeys[key];

            if (matchingKey) {
                acc[matchingKey] = params.org[key];
            } else {
                acc[key] = params.org[key];
            }
            return acc;
        }, {});
    }

    async createOrUpdatePerson(
        params: Record<string, any>,
        author: string
    ): Promise<Person> {
        let person;

        const now = new Date().getTime();

        const id = params.id;
        delete params.id;

        if (id === "NEW") {
            this.LoggerService.verbose(
                "Admin is creating a person with params",
                params
            );
            person = await this.PersonRepository.create({
                ...params,
                author,
                createdAt: now,
                updatedAt: now,
                orderIds: [],
            });
        } else {
            this.LoggerService.verbose(`Updating the person ${id}`);
            person = await this.PersonRepository.update(id, {
                ...params,
                author,
                updatedAt: now,
            });
        }

        return person;
    }

    getOrderContactInfoFromPerson(person: Person): Record<string, any> {
        const contactInfo = {};
        for (const [orderKey, personKey] of Object.entries(
            GenericOrderKeysToPersonKeys
        )) {
            contactInfo[orderKey] = person[personKey] || "";
        }
        return contactInfo;
    }

    async serializePerson(person: Person): Promise<SerializedPerson> {
        let orgName;
        if (person.orgId) {
            const org = await this.OrgRepository.getById(person.orgId);
            orgName = org ? org.name : null;
        }

        return {
            ...person,
            orgName: orgName || null,
        };
    }

    async createOrUpdateOrg(
        params: Record<string, any>,
        author: string
    ): Promise<Org> {
        const id = params.id;
        delete params.id;

        let org;
        const now = new Date().getTime();

        if (id === "NEW") {
            this.LoggerService.verbose("Admin is creating an org");
            org = await this.OrgRepository.create({
                ...params,
                author,
                createdAt: now,
                updatedAt: now,
                orderIds: [],
            });
            params.createdAt = now;
        } else {
            this.LoggerService.verbose(`Updating the org ${id}`);

            org = await this.OrgRepository.update(id, {
                ...params,
                author,
                updatedAt: now,
            });
        }

        return org;
    }

    async getFormattedPersons(): Promise<Record<string, any>> {
        const translation = [
            { header: "id", ren: "Identifiant" },
            { header: "firstName", ren: "Prénom" },
            { header: "lastName", ren: "Nom" },
            { header: "title", ren: "Civilité" },
            { header: "position", ren: "Fonction" },
            { header: "email", ren: "E-mail" },
            { header: "telephone", ren: "Tél." },
            { header: "telephone2", ren: "Tél. 2" },
            { header: "generalTags", ren: "Tags" },
            { header: "orgId", ren: "Id Organisation" },
            { header: "orgName", ren: "Nom Organisation" },
            { header: "orderIds", ren: "Dossiers" },
            { header: "owner", ren: "Propriétaire" },
            { header: "author", ren: "Auteur" },
            { header: "createdAt", ren: "Création" },
            { header: "updatedAt", ren: "Mise à jour" },
            { header: "isConfirmed", ren: "Confirmé" },
        ];

        const { headers, rename } = translation.reduce(
            ({ headers, rename }, { header, ren }) => ({
                headers: [...headers, header],
                rename: [...rename, ren],
            }),
            { headers: [], rename: [] }
        );

        const dateFormat = "dd/MM/yyyy - HH:mm";
        const orgs = (await this.OrgRepository.getAll()).reduce((acc, org) => ({
            ...acc,
            [org.id]: org.name,
        }));
        const persons = await this.PersonRepository.getAll();
        const data = persons.map((person) => {
            const filteredPerson: Partial<Person> = Object.keys(person)
                .filter((key) => headers.includes(key))
                .reduce((obj, key) => {
                    obj[key] = person[key];
                    return obj;
                }, {});

            return {
                ...filteredPerson,
                author: this.translateAuthor(filteredPerson.author),
                orgName: filteredPerson.orgId
                    ? orgs[filteredPerson.orgId]
                    : null,
                isConfirmed: filteredPerson.isConfirmed ? "Oui" : "Non",
                createdAt: person.createdAt
                    ? format(new Date(person.createdAt), dateFormat, {
                          locale: fr,
                      })
                    : "",
                updatedAt: person.updatedAt
                    ? format(new Date(person.updatedAt), dateFormat, {
                          locale: fr,
                      })
                    : "",
            };
        });

        return { data, headers, rename };
    }

    private translateAuthor(author): string {
        let translation = author;
        switch (author) {
            case "Exhibitor":
                translation = "Participant";
                break;
            case "Organizer":
                translation = "Organisateur";
                break;
            default:
                break;
        }
        return translation;
    }

    async getFormattedPersonsForEmailing(
        filteredOrgIds: string[],
        role: string
    ): Promise<Record<string, any>> {
        const translation = [
            { header: "orgId", ren: "Identifiant organisation" },
            { header: "orgName", ren: "Nom organisation" },
            { header: "id", ren: "Identifiant personne" },
            { header: "firstName", ren: "Prénom" },
            { header: "lastName", ren: "Nom" },
            { header: "email", ren: "E-mail" },
            { header: "telephone", ren: "Tél." },
            { header: "position", ren: "Fonction" },
        ];

        const { headers, rename } = translation.reduce(
            ({ headers, rename }, { header, ren }) => ({
                headers: [...headers, header],
                rename: [...rename, ren],
            }),
            { headers: [], rename: [] }
        );

        const allPersons = await this.PersonRepository.getAll();

        const orgs = (await this.OrgRepository.getAll()).reduce((acc, org) => ({
            ...acc,
            [org.id]: org.name,
        }));

        const persons = filteredOrgIds
            ? allPersons.filter(
                  (p) =>
                      p.orgId &&
                      filteredOrgIds.includes(p.orgId) &&
                      p.roles.includes(role)
              )
            : allPersons;
        const data = persons.map((person) => {
            const filteredPerson = Object.keys(person)
                .filter((key) => headers.includes(key))
                .reduce((obj, key) => {
                    obj[key] = person[key];
                    return obj;
                }, {});

            return {
                ...filteredPerson,
                orgName: orgs[filteredPerson["orgId"]],
            };
        });

        return { data, headers, rename };
    }

    async getFormattedOrgs({
        typologies,
        eventToEventTag,
        orderIdToEventAndStatus,
        filteredIds,
    }): Promise<Record<string, any>> {
        const translation = [
            { header: "id", ren: "Identifiant" },
            { header: "name", ren: "Nom" },
            { header: "website", ren: "Site web" },
            { header: "instagram", ren: "Instagram" },
            { header: "facebook", ren: "Facebook" },
            { header: "linkedin", ren: "LinkedIn" },
            { header: "address", ren: "Adresse" },
            { header: "address2", ren: "Adresse 2" },
            { header: "city", ren: "Ville" },
            { header: "postalCode", ren: "Code postal" },
            { header: "department", ren: "Département" },
            { header: "country", ren: "Pays" },
            { header: "siret", ren: "SIRET" },
            { header: "generalTags", ren: "Tags" },
            { header: "businessTags", ren: "Produits vendus" },
            { header: "typologies", ren: "Typologies" },
            { header: "activityDesc", ren: "Description de l'activité" },
            { header: "comment", ren: "Commentaire" },
            { header: "orderIds", ren: "Dossiers" },
            { header: "owner", ren: "Propriétaire" },
            { header: "author", ren: "Auteur" },
            { header: "source", ren: "Source" },
            { header: "sourceDetail", ren: "Détail source" },
            { header: "sourceTags", ren: "Tags source" },
            { header: "status", ren: "Statut" },
            { header: "heat", ren: "Chaleur" },
            { header: "targetEventsTags", ren: "Salons cibles" },
            {
                header: "participations-Requested",
                ren: "Participations (Demande d'accès)",
            },
            {
                header: "participations-Rejected",
                ren: "Participations (Demande rejetée)",
            },
            {
                header: `participations-${OrderStatus.DRAFT}`,
                ren: "Participations (Brouillon)",
            },
            {
                header: `participations-${OrderStatus.SUBMITTED}`,
                ren: "Participations (À valider)",
            },
            {
                header: `participations-${OrderStatus.VALIDATED}`,
                ren: "Participations (Validé)",
            },
            {
                header: `participations-${OrderStatus.REFUSED}`,
                ren: "Participations (Refusé)",
            },
            {
                header: `participations-${OrderStatus.CANCELLED}`,
                ren: "Participations (Annulé)",
            },
            { header: "createdAt", ren: "Création" },
            { header: "updatedAt", ren: "Mise à jour" },
            { header: "isConfirmed", ren: "Confirmé" },
        ];

        const { headers, rename } = translation.reduce(
            ({ headers, rename }, { header, ren }) => ({
                headers: [...headers, header],
                rename: [...rename, ren],
            }),
            { headers: [], rename: [] }
        );

        const dateFormat = "dd/MM/yyyy - HH:mm";
        const fetchedOrgs = await this.OrgRepository.getAll();

        const orgs = filteredIds
            ? fetchedOrgs.filter((o) => filteredIds.includes(o.id))
            : fetchedOrgs;

        const data = orgs.map((org) => {
            const participations = (org.orderIds || [])
                .map((oId) => orderIdToEventAndStatus[oId])
                .filter(commonUtils.notNil)
                .reduce((acc, { event, status }) => {
                    const eventTag = eventToEventTag[event];
                    acc[`participations-${status}`] = commonUtils.keepUnique([
                        ...(acc[`participations-${status}`] || []),
                        eventTag,
                    ]);

                    return acc;
                }, {});

            const pimpedOrg = { ...org, ...participations };
            const filteredOrg: Partial<Org> = Object.keys(pimpedOrg)
                .filter((key) => headers.includes(key))
                .reduce((obj, key) => {
                    obj[key] = pimpedOrg[key];
                    return obj;
                }, {});

            return {
                ...filteredOrg,
                author: this.translateAuthor(filteredOrg.author),
                typologies: (filteredOrg.typologies || []).map(
                    (t) => typologies[t] || t
                ),
                sourceTags: filteredOrg.sourceTags || [],
                targetEventsTags: filteredOrg.targetEventsTags || [],
                isConfirmed: filteredOrg.isConfirmed ? "Oui" : "Non",
                createdAt: format(new Date(org.createdAt), dateFormat, {
                    locale: fr,
                }),
                updatedAt: format(new Date(org.updatedAt), dateFormat, {
                    locale: fr,
                }),
            };
        });

        return { data, headers, rename };
    }
}
