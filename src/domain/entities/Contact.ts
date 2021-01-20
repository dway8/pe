export type Person = {
    id?: string;
    author: string;
    createdAt: number;
    updatedAt: number;
    orderIds: string[];
    orgId?: string;
    roles: string[];
    isConfirmed?: boolean;
};

export type SerializedPerson = Person & {
    orgName: string | null;
};

export const GenericOrderKeysToPersonKeys = {
    contactLastName: "lastName",
    contactFirstName: "firstName",
    contactEmail: "email",
    contactPhone: "telephone",
    fonctionRespDossier: "position",
};

export type Org = {
    id: string;
    author: string;
    createdAt: number;
    updatedAt: number;
    orderIds: string[];
    name: string;
    typologies?: [];
    sourceTags?: [];
    targetEventsTags?: [];
    isConfirmed?: boolean;
};

export const GenericOrderKeysToOrgKeys = {
    brandName: "organization",
    website: "website",
    instagram: "instagram",
    facebook: "facebook",
    linkedin: "linkedin",
    address: "address",
    address2: "address2",
    city: "city",
    postalCode: "postalCode",
    country: "country",
    numSiret: "siret",
    activityDesc: "activityDesc",
};
