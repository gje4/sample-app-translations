export const useConciseMetafieldStorage:boolean = true;

export const defaultLocale:string = 'en';

export const availableLocales:Array<{code:string, label: string}> = [
  {
    code: 'en',
    label: 'English',
  },{
    code: 'es',
    label: 'Spanish',
  },{
    code: 'fr',
    label: 'French',
  },
];

export const translatableProductFields:Array<{key:string, label: string, type: string, required: boolean}> = [
  {
    key: 'name',
    label: 'Name',
    type: 'input',
    required: true,
  },
  {
    key: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
  },
  {
    key: 'page_title',
    label: 'Page Title',
    type: 'input',
    required: false,
  },
  {
    key: 'meta_keywords',
    label: 'Meta Keywords',
    type: 'input',
    required: false,
  },
];
