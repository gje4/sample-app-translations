import {
  Button,
  Box,
  Checkbox,
  Flex,
  FormGroup,
  H1,
  HR,
  Input,
  Panel,
  Select,
  Form as StyledForm,
  Textarea,
  Text,
  Dropdown,
  FlexItem,
} from "@bigcommerce/big-design";
import { useRouter } from 'next/router';
import { ArrowBackIcon } from '@bigcommerce/big-design-icons';
import { ChangeEvent, FormEvent, useState } from "react";
import { FormData, StringKeyValue } from "../types";

interface FormProps {
  formData: FormData;
  onCancel(): void;
  onSubmit(form: FormData, selectedLocale: string): void;
}

const FormErrors = {
  name: "Product name is required",
  price: "Default price is required",
};

function ProductForm({ formData, onCancel, onSubmit }: FormProps) {
  const router = useRouter();
  const [currentLocale, setLocale] = useState<string>('en');

  const getMetafieldValue = (fieldName: string, locale: string) => {
    console.log('locale', locale)
    const filteredFields = formData.metafields.filter((meta) => meta.namespace === locale && meta.key === fieldName);
    console.log('f', filteredFields)
    return filteredFields[0]?.value;
  }

  const { description, isVisible, name, price, type, metafields } = formData;
  
  const [form, setForm] = useState<FormData>({
    description: getMetafieldValue('description', currentLocale) || description,
    isVisible,
    name: getMetafieldValue('name', currentLocale) || name,
    price,
    type,
    metafields,
  });

  const [errors, setErrors] = useState<StringKeyValue>({});

  const handleBackClick = () => router.push('/');

  const handleLocaleChange = (selectedLocale) => {
    console.log('selectedLocale', selectedLocale)
    setForm({
      ...form,
      ...{
        description: getMetafieldValue('description', selectedLocale) || description,
        name: getMetafieldValue('name', selectedLocale) || name,
      }
    })
    setLocale(selectedLocale);
  }

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name: formName, value } = event?.target;
    setForm((prevForm) => ({ ...prevForm, [formName]: value }));

    // Add error if it exists in FormErrors and the input is empty, otherwise remove from errors
    !value && FormErrors[formName]
      ? setErrors((prevErrors) => ({
          ...prevErrors,
          [formName]: FormErrors[formName],
        }))
      : setErrors(({ [formName]: removed, ...prevErrors }) => ({
          ...prevErrors,
        }));
  };

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { checked, name: formName } = event?.target;
    setForm((prevForm) => ({ ...prevForm, [formName]: checked }));
  };

  const handleSubmit = (event: FormEvent<EventTarget>) => {
    event.preventDefault();
    console.log("submit", form);

    // If there are errors, do not submit the form
    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) return;

    onSubmit(form, currentLocale);
  };

  return (
    <>
      <Box marginBottom="xxLarge">
          <Flex>
            <FlexItem flexGrow={1}>
              <Button iconLeft={<ArrowBackIcon color="secondary50" />} variant="subtle" onClick={handleBackClick}>
                <Text bold color="secondary50">Products</Text>
              </Button>
            </FlexItem>
            <FlexItem flexGrow={0}>
              <Select
                name="lang"
                options={[
                  { value: "en", content: "English (en)" },
                  { value: "es", content: "Spanish (es)" },
                  { value: "ca-fr", content: "CA-FR" },
                ]}
                placeholder="Select Language"
                required
                value={currentLocale}
                onOptionChange={handleLocaleChange}
              />
            </FlexItem>
          </Flex>
          {name && <H1>{name}</H1>}
          <HR color="secondary30" />
      </Box>
      <StyledForm onSubmit={handleSubmit}>
        <Panel header="Basic Information">
          <FormGroup>
            <Input
              error={errors?.name}
              label="Product name"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
            />
          </FormGroup>
        </Panel>

        <Panel header="Translations">        
          <FormGroup>
            <Textarea
              label={form.type + "  " + "name"}
              name="name"
              placeholder="Name info"
              required
              value={form.name}
              onChange={handleChange}
            />
            <Textarea
              label={form.type + "  " + "Description"}
              name="description"
              placeholder="Product info"
              required
              value={form.description}
              onChange={handleChange}
            />
          </FormGroup>
        </Panel>
        <Flex justifyContent="flex-end">
          <Button
            marginRight="medium"
            type="button"
            variant="subtle"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </Flex>
      </StyledForm>
    </>
  );
}

export default ProductForm;
