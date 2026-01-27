import { createContext, useContext, useState, useRef, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from '@mui/material';

const ConfirmContext = createContext();

export function useConfirm() {
    return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }) {
    const [state, setState] = useState({
        open: false,
        title: '',
        description: '',
        confirmationText: 'Confirm',
        cancellationText: 'Cancel',
        dialogProps: {},
        confirmationButtonProps: {},
        cancellationButtonProps: {},
    });

    const fn = useRef();

    const confirm = useCallback((options = {}) => {
        return new Promise((resolve) => {
            setState({
                open: true,
                title: options.title || 'Are you sure?',
                description: options.description || '',
                confirmationText: options.confirmationText || 'Confirm',
                cancellationText: options.cancellationText || 'Cancel',
                dialogProps: options.dialogProps || {},
                confirmationButtonProps: options.confirmationButtonProps || {},
                cancellationButtonProps: options.cancellationButtonProps || {},
            });
            fn.current = { resolve };
        });
    }, []);

    const handleClose = useCallback(() => {
        setState(prev => ({ ...prev, open: false }));
        fn.current?.resolve(false);
    }, []);

    const handleConfirm = useCallback(() => {
        setState(prev => ({ ...prev, open: false }));
        fn.current?.resolve(true);
    }, []);

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            <Dialog
                open={state.open}
                onClose={handleClose}
                {...state.dialogProps}
                maxWidth="xs"
                fullWidth
            >
                {state.title && <DialogTitle>{state.title}</DialogTitle>}
                <DialogContent>
                    {state.description && (
                        <DialogContentText>{state.description}</DialogContentText>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleClose}
                        color="inherit"
                        {...state.cancellationButtonProps}
                    >
                        {state.cancellationText}
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        color="primary"
                        autoFocus
                        {...state.confirmationButtonProps}
                    >
                        {state.confirmationText}
                    </Button>
                </DialogActions>
            </Dialog>
        </ConfirmContext.Provider>
    );
}
