import { Button, Box, Flex, H1, HR, Input, Panel, Select, Form as StyledForm, Textarea, Text, FlexItem } from "@bigcommerce/big-design";
import { useRouter } from "next/router";
import { ArrowBackIcon, ArrowUpwardIcon } from "@bigcommerce/big-design-icons";
import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { FormData, StringKeyValue } from "@types";
import { availableLocales, defaultLocale, translatableProductFields } from "@lib/constants";
import { useStoreLocale } from "@lib/hooks";
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
  const { locale: storeLocale } = useStoreLocale();
  const defaultStoreLocale = storeLocale || defaultLocale;
  const [currentLocale, setLocale] = useState<string>(defaultStoreLocale);

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

  return (
    <>
      <Box marginBottom="xxLarge">
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
            </Box>
          </FlexItem>
        </Flex>
        <HR color="secondary30" />
      </Box>

      {/* Main Form */}
      <StyledForm fullWidth={true} onSubmit={handleSubmit}>
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
              position: 'fixed',
              textAlign: 'right',
              right: '5rem',
              width: '15rem',
              top: '15rem',
              backgroundColor: 'white',
              padding: '1rem',
              opacity: '0.9',
              }}>
              <ArrowUpwardIcon color="primary60" size="xLarge" />
              <Text color="primary60">Select a locale above to start editing translations for this product.</Text>
            </Box> 
          }
        </Panel>

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
      </StyledForm>
    </>
  );
}

export default ProductForm;
