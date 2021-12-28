import { Button, Box, Flex, FlexItem, H1, HR, Input, Panel, Popover, Select, Form as StyledForm, Textarea, Text } from "@bigcommerce/big-design";
import { useRouter } from "next/router";
import { ArrowBackIcon, ArrowUpwardIcon, AddIcon } from "@bigcommerce/big-design-icons";
import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { FormData, StringKeyValue } from "@types";
import { availableLocales, defaultLocale, translatableProductFields } from "@lib/constants";
import { useStoreLocale, useDbLocales } from "@lib/hooks";
import { alertsManager } from "@pages/_app";
import { useSession } from '../context/session';
import styled from 'styled-components';

const StyledFlex = styled(Box)`
  bottom: 0;
  left: 0;
  position: fixed;
  width: 100%;
`;

interface FormProps {
  formData: FormData;
  onCancel(): void;
  onSubmit(form: FormData, selectedLocale: string): void;
  isSaving: boolean;
} 

const FormErrors = {};

function ProductForm({ formData: productData, onCancel, onSubmit, isSaving }: FormProps) {
  const router = useRouter();
  const { context } = useSession();
  const { locale: storeLocale } = useStoreLocale();
  const { isLoading: isDbLocalesLoading, dbLocales } = useDbLocales();
  const defaultStoreLocale = storeLocale || defaultLocale;
  const [currentLocale, setLocale] = useState<string>(defaultStoreLocale);

  console.log('productData: ', productData);
  console.log('dbLocales: ', dbLocales);

  useEffect(() => {
    defaultStoreLocale && setLocale(defaultStoreLocale);
  }, [defaultStoreLocale, setLocale]);

  const getMetafieldValue = (fieldName: string, locale: string) => {
    const filteredFields = productData.metafields.filter(
      (meta) => meta.namespace === locale && meta.key === fieldName
    );
    return filteredFields[0]?.value;
  };

  const getFormObjectForLocale = (locale: string) => {
    const formObject = Object.fromEntries(translatableProductFields.map((field) => {
      return [ 
        field.key, 
        getMetafieldValue(field.key, locale) || productData[field.key] || ''
      ];
    }));

    formObject.metafields = productData['metafields'];

    return formObject;
  }

  const defaultLocaleProductData = productData;
  const initialFormObject = getFormObjectForLocale(currentLocale);

  const [form, setForm] = useState<FormData>(initialFormObject);

  const [errors, setErrors] = useState<StringKeyValue>({});

  const handleBackClick = () => router.push("/");

  const handleLocaleChange = (selectedLocale) => {
    let newFormObject = getFormObjectForLocale(selectedLocale);

    setForm({
      ...form,
      ...newFormObject,
    });

    setLocale(selectedLocale);
  };

  // Product Form handlers
  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name: fieldName, value } = event?.target;

    form[fieldName] = value;

    setForm(form);

    // Add error if it exists in FormErrors and the input is empty, otherwise remove from errors
    !value && FormErrors[fieldName]
      ? setErrors((prevErrors) => ({
          ...prevErrors,
          [fieldName]: FormErrors[fieldName],
        }))
      : setErrors(({ [fieldName]: removed, ...prevErrors }) => ({
          ...prevErrors,
        }));
  };

  const handleSubmit = (event: FormEvent<EventTarget>) => {
    event.preventDefault();

    // If there are errors, do not submit the form
    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) return;

    onSubmit(form, currentLocale);
  };

  // New Locale Form styles, state & handlers
  const [ showNewLocaleForm, setShowNewLocaleForm ] = useState<boolean>(false);
  const [ newLocaleForm, setNewLocaleForm ] = useState({});
  const [ newLocaleCodeRef, setNewLocaleCodeRef ] = useState(null);
  const [ newLocaleLabelRef, setNewLocaleLabelRef ] = useState(null);
  const newLocaleErrors = {
    label: 'Please enter a label(special characters not allowed)',
    code: 'Please enter lowercase, two character code',
  };
  const [ newLocaleError, setNewLocaleError ] = useState({});
  const handleNewLocaleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { target } = event;
    const { name: fieldName, value } = target;
    const regex = RegExp(target.pattern, 'g');

    regex.test(target.value) 
      ? setNewLocaleError((prev) => ({...prev, [fieldName]: ''})) 
      : setNewLocaleError((prev) => ({...prev, [fieldName]: newLocaleErrors[fieldName]}));

    if(fieldName === 'code' && dbLocales.find(locale => locale.code === value)) {
      setNewLocaleError((prev) => ({...prev, [fieldName]: 'Sorry, the code you entered is already in use'}));
    }

    newLocaleForm[fieldName] = value;

    setNewLocaleForm(newLocaleForm);

    console.log('fieldname: ', fieldName);
    console.log('new locale errors: ', newLocaleError);
  };
  const handleNewLocaleSubmit = async (event: FormEvent<EventTarget>) => {
    event.preventDefault();

    console.log('new locale form data: ', newLocaleForm);

    const options = {
      method: 'PUT',
      body: JSON.stringify(newLocaleForm),
    }
    const response = await fetch(`/api/db/locales?context=${context}`, options);

    if(response.ok) {
      setShowNewLocaleForm(false);
      alertsManager.add({
        messages: [
          {
            text: 'Language Added Successfully!',
          },
        ],
        type: 'success',
      });
    } else {
      alertsManager.add({
        messages: [
          {
            text: 'Sorry there was a problem adding the langauge',
          },
        ],
        type: 'error',
      });
    }
  };

  return (
    <>
      {/* Header */}
      <Box marginBottom="xxLarge" as="header">
        <Flex>
          <FlexItem flexGrow={1} alignSelf="flex-start">
            <Button
              iconLeft={<ArrowBackIcon color="secondary50" />}
              variant="subtle"
              onClick={handleBackClick}
            >
              <Text bold color="secondary50">
                Products
              </Text>
            </Button>
          </FlexItem>
        </Flex>
        <Flex>
          <FlexItem flexGrow={1} alignSelf="flex-start">
            {defaultLocaleProductData['name'] && <H1>{defaultLocaleProductData['name']}</H1>}
          </FlexItem>
          <FlexItem flexGrow={0}>
            <Box paddingBottom="small">
              {!dbLocales && (
                <Select
                  name="lang"
                  options={availableLocales.map((locale) => ({
                    value: locale.code,
                    content: `${locale.label} ${locale.code === defaultStoreLocale ? '(Default)': ''}`,
                  }))}
                  placeholder="Select Language"
                  required
                  value={currentLocale}
                  onOptionChange={handleLocaleChange}
                />
              )}
              {dbLocales && (
                  <Select
                    name="lang"
                    options={dbLocales.map((locale) => ({
                      value: locale.code,
                      content: `${locale.label} ${locale.code === defaultStoreLocale ? '(Default)': ''}`,
                    }))}
                    placeholder="Select Language"
                    required
                    value={currentLocale}
                    onOptionChange={handleLocaleChange}
                    action={{
                      actionType: 'normal' as const,
                      content: 'Add Language',
                      icon: <AddIcon />,
                      onActionClick: () => setShowNewLocaleForm(true),
                    }}
                  />
              )}
            </Box>
          </FlexItem>
        </Flex>

        {/* New Locale Form */}
        {showNewLocaleForm && (
          <Flex justifyContent="flex-end">
            <StyledForm onSubmit={handleNewLocaleSubmit}>
              <Flex alignItems="flex-end" backgroundColor="secondary20" padding="medium" border="box" borderRadius="normal">
                <FlexItem marginRight="medium">
                  <Input
                    ref={setNewLocaleLabelRef}
                    label="New Language Label"
                    name="label"
                    required={true}
                    onChange={handleNewLocaleChange}
                    maxLength={48}
                    pattern="^[a-zA-z0-9\s]{1,48}$"
                    error={newLocaleError['label']}
                  />
                  <Popover
                    anchorElement={newLocaleLabelRef}
                    isOpen={newLocaleError['label'] && newLocaleError['label'] !== ''}
                    label="Locale Label Error"
                    placement="bottom-end"
                  >
                    {newLocaleError['label']}
                  </Popover>
                </FlexItem>
                <FlexItem marginRight="medium">
                  <Input
                    ref={setNewLocaleCodeRef}
                    label="Code"
                    name="code"
                    required={true}
                    onChange={handleNewLocaleChange}
                    size={2}
                    maxLength={2}
                    pattern="^[a-z0-9]{2}$"
                    error={newLocaleError['code']}
                  />
                  <Popover
                    anchorElement={newLocaleCodeRef}
                    isOpen={newLocaleError['code'] && newLocaleError['code'] !== ''}
                    label="Locale Code Error"
                    placement="bottom-end"
                  >
                    {newLocaleError['code']}
                  </Popover>
                </FlexItem>
                <FlexItem>
                  <Button
                    type="submit"
                  >
                    Add
                  </Button>
                </FlexItem>
              </Flex>
            </StyledForm>
          </Flex>
        )}
        <HR color="secondary30" />
      </Box>

      {/* Main Form */}
      <StyledForm fullWidth={true} onSubmit={handleSubmit}>
        <Box style={{position: 'relative'}}>
          <Panel>
            {translatableProductFields.map((field) =>
              <Box key={`${field.key}_${currentLocale}`}>
                {field.type === 'textarea' && 
                  <Flex>
                    <FlexItem flexGrow={1} paddingBottom="small">
                      <Box style={{maxWidth: '40rem'}}>
                        <Textarea
                          label={`${field.label} (${defaultStoreLocale})`}
                          name={`defaultLocale_${field.key}`}
                          defaultValue={defaultLocaleProductData[field.key]}
                          readOnly={true}
                          rows={5}
                          required={field.required}
                        />
                      </Box>
                    </FlexItem>
                    
                    {currentLocale !== defaultStoreLocale && 
                      <FlexItem flexGrow={1} paddingBottom="small">
                        <Box paddingLeft={{ mobile: "none", tablet: "xLarge" }} style={{maxWidth: '40rem'}}>
                          <Textarea
                            label={`${field.label} (${currentLocale})`}
                            name={field.key}
                            value={form[field.key]}
                            onChange={handleChange}
                            required={field.required}
                            rows={5}
                          />
                        </Box>
                      </FlexItem>
                    }
                  </Flex>
                }
                {field.type === 'input' && 
                  <Flex>
                    <FlexItem flexGrow={1} paddingBottom="small">
                      <Box style={{maxWidth: '40rem'}}>
                        <Input
                          label={`${field.label} (${defaultStoreLocale})`}
                          name={`defaultLocale_${field.key}`}
                          defaultValue={defaultLocaleProductData[field.key]}
                          readOnly={true}
                          required={field.required}
                        />
                      </Box>
                    </FlexItem>

                    {currentLocale !== defaultStoreLocale &&
                      <FlexItem flexGrow={1} paddingBottom="small">
                        <Box paddingLeft={{ mobile: "none", tablet: "xLarge" }} style={{maxWidth: '40rem'}}>
                          <Input
                            label={`${field.label} (${currentLocale})`}
                            name={field.key}
                            value={form[field.key]}
                            onChange={handleChange}
                            required={field.required}
                          />
                        </Box>
                      </FlexItem>
                    }
                  </Flex>
                }
              </Box>
            )}
            
            {currentLocale === defaultStoreLocale &&
              <Box style={{ 
                margin: 'auto',
                position: 'absolute',
                textAlign: 'right',
                right: '2rem',
                width: '15rem',
                top: '1rem',
                backgroundColor: 'white',
                padding: '1rem',
                opacity: '0.9',
                }}>
                <ArrowUpwardIcon color="primary60" size="xLarge" />
                <Text color="primary60">Select a locale above to start editing translations for this product.</Text>
              </Box> 
            }
          </Panel>

          {/* Actions Fixed Footer */}
          <StyledFlex backgroundColor="white" border="box" padding="medium">
            <Flex justifyContent="flex-end">
              <Button
                marginRight="medium"
                type="button"
                variant="subtle"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={(currentLocale === defaultStoreLocale)}
                isLoading={isSaving}
              >
                Save
              </Button>
            </Flex>
          </StyledFlex>
        </Box>
      </StyledForm>
    </>
  );
}

export default ProductForm;
