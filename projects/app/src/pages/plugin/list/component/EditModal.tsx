import React, { useCallback, useState } from 'react';
import {
  Box,
  Flex,
  Button,
  ModalHeader,
  ModalBody,
  Input,
  Textarea,
  IconButton
} from '@chakra-ui/react';
import { useSelectFile } from '@/web/common/file/hooks/useSelectFile';
import { useForm } from 'react-hook-form';
import { compressImg } from '@/web/common/file/utils';
import { getErrText } from '@fastgpt/global/common/error/utils';
import { useToast } from '@/web/common/hooks/useToast';
import { useRouter } from 'next/router';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { useRequest } from '@/web/common/hooks/useRequest';
import { delOnePlugin, postCreatePlugin, putUpdatePlugin } from '@/web/core/plugin/api';
import Avatar from '@/components/Avatar';
import MyTooltip from '@/components/MyTooltip';
import MyModal from '@/components/MyModal';
import { useTranslation } from 'react-i18next';
import { useConfirm } from '@/web/common/hooks/useConfirm';
import MyIcon from '@/components/Icon';

export type FormType = {
  id?: string;
  avatar: string;
  name: string;
  intro: string;
};
export const defaultForm = {
  avatar: '/icon/logo.svg',
  name: '',
  intro: ''
};

const CreateModal = ({
  defaultValue = defaultForm,
  onClose,
  onSuccess,
  onDelete
}: {
  defaultValue?: FormType;
  onClose: () => void;
  onSuccess: () => void;
  onDelete: () => void;
}) => {
  const { t } = useTranslation();
  const [refresh, setRefresh] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { isPc } = useSystemStore();
  const { openConfirm, ConfirmModal } = useConfirm({
    title: t('common.Delete Tip'),
    content: t('plugin.Confirm Delete')
  });

  const { register, setValue, getValues, handleSubmit } = useForm<FormType>({
    defaultValues: defaultValue
  });

  const { File, onOpen: onOpenSelectFile } = useSelectFile({
    fileType: '.jpg,.png,.svg',
    multiple: false
  });

  const onSelectFile = useCallback(
    async (e: File[]) => {
      const file = e[0];
      if (!file) return;
      try {
        const src = await compressImg({
          file,
          maxW: 100,
          maxH: 100
        });
        setValue('avatar', src);
        setRefresh((state) => !state);
      } catch (err: any) {
        toast({
          title: getErrText(err, t('common.Select File Failed')),
          status: 'warning'
        });
      }
    },
    [setValue, t, toast]
  );

  const { mutate: onclickCreate, isLoading: creating } = useRequest({
    mutationFn: async (data: FormType) => {
      return postCreatePlugin(data);
    },
    onSuccess(id: string) {
      router.push(`/plugin/edit?pluginId=${id}`);
      onSuccess();
      onClose();
    },
    successToast: t('common.Create Success'),
    errorToast: t('common.Create Failed')
  });
  const { mutate: onclickUpdate, isLoading: updating } = useRequest({
    mutationFn: async (data: FormType) => {
      if (!data.id) return Promise.resolve('');
      // @ts-ignore
      return putUpdatePlugin(data);
    },
    onSuccess() {
      onSuccess();
      onClose();
    },
    successToast: t('common.Update Success'),
    errorToast: t('common.Update Failed')
  });

  const onclickDelApp = useCallback(async () => {
    if (!defaultValue.id) return;
    try {
      await delOnePlugin(defaultValue.id);
      toast({
        title: t('common.Delete Success'),
        status: 'success'
      });
      onDelete();
    } catch (err: any) {
      toast({
        title: getErrText(err, t('common.Delete Failed')),
        status: 'error'
      });
    }
    onClose();
  }, [defaultValue.id, onClose, toast, t, onDelete]);

  return (
    <MyModal isOpen onClose={onClose} isCentered={!isPc}>
      <ModalHeader fontSize={'2xl'}>
        {defaultValue.id ? t('plugin.Update Your Plugin') : t('plugin.Create Your Plugin')}
      </ModalHeader>
      <ModalBody>
        <Box color={'myGray.800'} fontWeight={'bold'}>
          {t('plugin.Set Name')}
        </Box>
        <Flex mt={3} alignItems={'center'}>
          <MyTooltip label={t('common.Set Avatar')}>
            <Avatar
              flexShrink={0}
              src={getValues('avatar')}
              w={['28px', '32px']}
              h={['28px', '32px']}
              cursor={'pointer'}
              borderRadius={'md'}
              onClick={onOpenSelectFile}
            />
          </MyTooltip>
          <Input
            flex={1}
            ml={4}
            autoFocus={!defaultValue.id}
            bg={'myWhite.600'}
            {...register('name', {
              required: t("common.Name Can't Be Empty")
            })}
          />
        </Flex>
        <Box mt={3}>
          <Box mb={1}>{t('plugin.Intro')}</Box>
          <Textarea {...register('intro')} bg={'myWhite.600'} rows={5} />
        </Box>
      </ModalBody>

      <Flex px={5} py={4}>
        {!!defaultValue.id && (
          <IconButton
            className="delete"
            size={'sm'}
            icon={<MyIcon name={'delete'} w={'14px'} />}
            variant={'base'}
            borderRadius={'md'}
            aria-label={'delete'}
            _hover={{
              bg: 'red.100'
            }}
            onClick={(e) => {
              e.stopPropagation();
              openConfirm(onclickDelApp)();
            }}
          />
        )}
        <Box flex={1} />
        <Button variant={'base'} mr={3} onClick={onClose}>
          {t('common.Close')}
        </Button>
        {!!defaultValue.id ? (
          <Button isLoading={updating} onClick={handleSubmit((data) => onclickUpdate(data))}>
            {t('common.Confirm Update')}
          </Button>
        ) : (
          <Button isLoading={creating} onClick={handleSubmit((data) => onclickCreate(data))}>
            {t('common.Confirm Create')}
          </Button>
        )}
      </Flex>

      <File onSelect={onSelectFile} />
      <ConfirmModal />
    </MyModal>
  );
};

export default CreateModal;
